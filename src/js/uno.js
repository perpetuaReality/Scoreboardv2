import React from "react";
import ReactDOM from "react-dom";
import { ModalTypes, ModalOptions, ModalDialog } from "./modal";

import css from "../css/styles.css";

class TallyButton extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initialState;
		this.penaltyPrompt = this.penaltyPrompt.bind(this);
		this.setWinner = this.setWinner.bind(this);
	}

	get initialState() {
		return { isWinner: false, penalty: 0, modalOptions: new ModalOptions() };
	}

	penaltyPrompt() {
		this.props.onPenaltyPrompt(this.props.player);
	}

	setWinner() {
		this.props.onWinnerChosen(this.props.player);
		this.setState({ isWinner: true });
	}

	componentDidUpdate() {
		if (this.props.reset) {
			this.setState(this.initialState);
			this.props.onReset();
		}
	}

	render() {
		const player = this.props.player;
		const style = {
			backgroundColor: player.colour,
			color: player.isLight ? "black" : "white"
		};
		var penaltyText = this.props.player.currentPenalty > 0 ? `[+${this.props.player.currentPenalty}] ✏️` : "";
		let btn = null;

		if (this.props.winnerChosen) {
			if (this.state.isWinner)
				btn = <button disabled className="tally_button" style={style}>{player.name} <span>[WINNER] 🔒</span></button>;
			else
				btn = <button className="tally_button" onClick={this.penaltyPrompt} style={style}>{player.name} <span>{penaltyText}</span></button>;
		} else {
			btn = <button className="tally_button" onClick={this.setWinner} style={style}>{player.name}</button>;
		}
		return btn;
	}
}

class TallyPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.initialState;
		this.winnerChosen = this.winnerChosen.bind(this);
		this.setPenalty = this.setPenalty.bind(this);
		this.consolidateLoot = this.consolidateLoot.bind(this);
		this.tallyUp = this.tallyUp.bind(this);
	}

	get initialState() {
		return { winnerChosen: false, winner: "", loot: 0, isFinished: false, modalOptions: new ModalOptions(), reset: false };
	}

	winnerChosen(winner) {
		this.setState({ winnerChosen: true, winner: winner });
	}

	setPenalty(player) {
		let penalty = null;
		let closeDialog = (input) => {
			this.setState({ modalOptions: new ModalOptions() });
			penalty = parseInt(input);
		};
		this.setState({
			modalOptions: new ModalOptions(true, ModalTypes.PROMPT,
				`How many points was ${player.name} caught with?`,
				(input) => {
					closeDialog(input);
					//Don't set the penalty if the prompt was empty, zero, or not a number at all.
					if (penalty == null || penalty == "0") return;
					if (isNaN(penalty) || !Number.isSafeInteger(parseInt(penalty))) return;
					//Set the penalty on the player's record.
					this.props.players.find(val => val.colour == player.colour).currentPenalty = penalty;
				},
				() => closeDialog())
		});
	}

	consolidateLoot() {
		var totalLoot = 0;
		this.props.players.forEach((player) => {
			totalLoot += player.currentPenalty;
			player.currentPenalty = 0;
		});
		this.setState({ loot: totalLoot, isFinished: true });
	}

	tallyUp() {
		var players = this.props.players;
		var winner = players.find(player => player.colour == this.state.winner.colour);
		winner.points += this.state.loot;
		players.forEach(player => player.scoreLog.push(player.points));
		this.props.onTallyEnd(players, winner);
	}

	render() {
		var buttonList = this.props.players.map(
			player => <TallyButton key={player.colour} player={player} winnerChosen={this.state.winnerChosen} onWinnerChosen={this.winnerChosen} onPenaltyPrompt={this.setPenalty} reset={this.state.reset} onReset={() => this.setState(this.initialState)} />
		);
		let tallyBtn = null;
		let content = null;
		let header = null;
		if (this.state.winnerChosen && !this.state.isFinished) tallyBtn = (
			<React.Fragment>
				<button onClick={() => { this.setState({ reset: true }); }}>✏️ Change Winner</button>
				<button onClick={() => { this.consolidateLoot(); }}>📒 Tally-up Points</button>
			</React.Fragment>
		);
		if (!this.state.isFinished)
			content = buttonList;
		else
			content = <button onClick={this.tallyUp}>▶️ Continue</button>;

		if (!this.state.winnerChosen) {
			header = "Who won?";
		} else {
			if (!this.state.isFinished) {
				header = `How many points does ${this.state.winner.name} get?`;
			} else {
				header = `${this.state.winner.name} won and got ${this.state.loot} points!`;
			}
		}
		return (
			<React.Fragment>
				<ModalDialog modalOptions={this.state.modalOptions} />
				<div className="modal_container" style={{ zIndex: 20 }}>
					<div className="tally_panel">
						<h1>{header}</h1>
						{tallyBtn}<br />{content}
					</div>
				</div>
			</React.Fragment>
		);
	}
}

export default TallyPanel;