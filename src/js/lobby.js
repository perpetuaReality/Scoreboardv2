import React from "react";
import ReactDOM from "react-dom";
import { ModalTypes, ModalOptions, ModalDialog } from "./modal";

import css from "../css/styles.css";

var colours = ["black", "lime", "green", "yellow", "orange", "red", "blue", "cyan", "purple", "hotpink", "navy", "chocolate", "olive", "tan", "silver", "salmon", "violet", "teal", "aquamarine", "brown", "crimson", "bisque", "gold", "beige", "burlywood", "indigo", "khaki", "lightgreen", "blueviolet"];
const lightColours = ["white", "lime", "yellow", "orange", "cyan", "hotpink", "tan", "silver", "salmon", "violet", "aquamarine", "bisque", "gold", "beige", "burlywood", "khaki", "lightgreen"];

const colouredNameTemplate = { name: "", colour: "black" };

class Player {
	constructor(name, colour) {
		this.name = name;
		this.colour = colour;
		this.isLight = lightColours.includes(colour);
		this.points = 0;
		this.position = 0;
		this.currentPenalty = 0;
		this.scoreLog = [0];
	}
}

class NameInput extends React.Component {
	constructor(props) {
		super(props);
		this.state = { hasChanged: false, colour: "white" };
		this.handleChange = this.handleChange.bind(this);
		this.assignColour = this.assignColour.bind(this);
	}

	handleChange(e) {
		this.setState({ hasChanged: true });
		this.props.onNameChange(this.props.id, { name: e.target.value, colour: this.state.colour });
	}

	assignColour(e) {
		//Only assign colours if the input has changed and the input isn't null or undefined.
		if (!this.state.hasChanged) { return; }
		if (e.target.value != "" && e.target.value !== null && e.target.value !== undefined) {
			//If the currently assigned colour was taken from the Array, it must be returned.
			if (!colours.includes(this.state.colour)) colours.push(this.state.colour);
			//Select a random colour from the Colour Array.
			var randomIndex = Math.round(Math.random() * (colours.length - 1));
			var randomColour = colours[randomIndex];
			//Take the colour from the Array.
			colours.splice(randomIndex, 1);
			//Assign the random colour.
			this.setState({ colour: randomColour });
			this.props.onNameChange(this.props.id, { name: e.target.value, colour: randomColour });
		}
		this.setState({ hasChanged: false });
	}

	render() {
		var styleColour = lightColours.includes(this.state.colour) ? "black" : "white";
		var style = { backgroundColor: this.state.colour, color: styleColour };
		return (
			<input className="name_input" style={style} onChange={this.handleChange} onBlurCapture={this.assignColour} maxLength="16" />
		);
	}
}

class Lobby extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			players: 10,
			colouredNames: Array.from({ length: 10 }, (v, i) => { colouredNameTemplate; }),
			modalOptions: new ModalOptions()
		};
		this.addPlayer = this.addPlayer.bind(this);
		this.updatePlayer = this.updatePlayer.bind(this);
		this.registerPlayers = this.registerPlayers.bind(this);
	}

	addPlayer(e) {
		e.preventDefault(); //This prevents the form from reloading the page
		const maxPlayerCount = 28;
		if (this.state.players < maxPlayerCount)
			this.setState(function (prevState) {
				var newCNames = prevState.colouredNames;
				newCNames.push(colouredNameTemplate);
				return { players: prevState.players + 1, colouredNames: newCNames };
			});
	}

	updatePlayer(index, newCName) {
		var updatedPlayers = this.state.colouredNames;
		updatedPlayers.splice(index, 1, newCName);
		this.setState({ colouredNames: updatedPlayers });
	}

	registerPlayers(e) {
		e.preventDefault(); //This prevents the form from reloading the page.
		let closeDialog = (confirm) => {
			this.setState({ modalOptions: new ModalOptions() });
			if (confirm) {
				//Lift the list of players to this Component's Parent.
				this.props.onPlayersReady(players);
			}
		};
		var players = this.state.colouredNames.filter(function (CName) {
			if (CName != undefined) {
				return (CName.name != "" && CName.name !== null && CName.name !== undefined);
			}
		}).map((name) => new Player(name.name, name.colour));
		//If the user aborts or there aren't at least two players, don't continue.
		if (players.length < 2) {
			this.setState({
				modalOptions: new ModalOptions(true, ModalTypes.ERROR,
					"At least two players are required to continue.", () => closeDialog(false))
			});
			return;
		}
		this.setState({
			modalOptions:
				new ModalOptions(true, ModalTypes.WARN,
				"REMEMBER: Once you enter these names, they and their associated colours CANNOT be changed. Are you sure you want to continue?", () => closeDialog(true), () => closeDialog(false))
		});
	}

	render() {
		return (
			<React.Fragment>
				<ModalDialog modalOptions={this.state.modalOptions} />
				<form onSubmit={this.registerPlayers}
					onKeyPress={(e) => { if (e.key == "Enter") { e.preventDefault(); this.registerBtn.click(); } }}>
					<h2>📝 Input the names of the players:</h2>
					<fieldset>
						{Array.from({ length: this.state.players }, (v, i) => <NameInput key={i} id={i} onNameChange={this.updatePlayer} />)}
					</fieldset>
					<button onClick={this.addPlayer}>➕ Add Player</button>
					<button ref={btn => this.registerBtn = btn} type="submit">✔️ Register Players</button>
				</form>
			</React.Fragment>
		);
	}
}

export default Lobby;