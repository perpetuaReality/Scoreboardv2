import React from "react";
import ReactDOM from "react-dom";
import Chart from "chart.js";
import {Line} from "react-chartjs-2";

import Lobby from "./lobby";
import Scoreboard from "./board";
import TallyPanel from "./uno";

import SettingsWindow from "./settings";

class End_Chart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {isDarkTheme: false};
		this.changeChartTheme = this.changeChartTheme.bind(this);
	}
	
	changeChartTheme() {
		var isDarkTheme = this.state.isDarkTheme;
		Chart.plugins.register({
			beforeDraw: function (chartInstance) {
				var ctx = chartInstance.chart.ctx;
				ctx.fillStyle = isDarkTheme ? "rgb(255, 255, 255)" : "rgb(33, 33, 33)";
				ctx.fillRect(0, 0, chartInstance.chart.width, chartInstance.chart.height);
			}
		});
		Chart.defaults.global.defaultFontColor = isDarkTheme ? "#666" : "#FFF";
		this.refs.Chart.chartInstance.update();
		this.setState(prevState => ({ isDarkTheme: !prevState.isDarkTheme }));
	}
	
	render() {
		let data = [];
		let rounds = [];
		let players = this.props.players;

		players.forEach(function (player) {
			data.push({
				fill: false,
				label: player.name,
				borderColor: player.colour,
				backgroundColor: player.colour,
				pointBorderColor: player.colour,
				pointBackgroundColor: player.bg,
				data: player.scoreLog,
			});
		});
		for (var i = 0; i < this.props.roundCount + 1; i++) {
			rounds.push(i);
		}
		const options = {
			elements: {
				line: {
					tension: 0,
				}
			},
			scales: {
				xAxes: [{
					ticks: {
						max: this.props.roundCount,
						min: 0,
						stepSize: 0.5
					}
				}]
			}
		};
		Chart.defaults.global.defaultFontFamily = "Franklin Gothic Medium";
		Chart.defaults.global.defaultFontSize = 14;
		return (
			<React.Fragment>
				<Line ref="Chart" data={{labels: rounds, datasets: data}} options={options} />
				<button onClick={this.changeChartTheme}>Change Theme</button>
				<button onClick={this.props.onHideChart}>Hide Chart</button>
			</React.Fragment>
		);
	}
}

class App extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isRegistering: true,
			isTallying: false,
			wasWon: false,
			showingCard: true,
			showingChart: false,
			roundCount: 1,
			players: [],
			winner: null,
			// Game Mode Constants
			pointThreshold: 500
		};
		this.setScoreboard = this.setScoreboard.bind(this);
		this.setTallyUp = this.setTallyUp.bind(this);
		this.sortByPosition = this.sortByPosition.bind(this);
	}

	sortByPosition(players, lastWinner) {
		var sortedPlayers = players;
		sortedPlayers.sort((a, b) => b.points - a.points);
		sortedPlayers.forEach((player, pos) => { player.position = pos + 1; });
		this.setState({ roundCount: this.state.roundCount + 1, players: sortedPlayers, isTallying: false });
		if (lastWinner.points >= this.state.pointThreshold)
			this.setState({ roundCount: this.state.roundCount, wasWon: true, winner: lastWinner });
	}

	setScoreboard(players) {
		this.setState({ isRegistering: false, players: players });
	}

	setTallyUp(e) {
		if(!this.state.wasWon) {
			this.setState({ isTallying: true });
		} else {
			e.target.disabled = true;
		}
	}

	render() {
		let panel = null;
		if (this.state.isRegistering) {
			panel = <Lobby onPlayersReady={this.setScoreboard} />;
		} else {
			panel = <Scoreboard roundCount={this.state.roundCount} players={this.state.players} pointThreshold={this.state.pointThreshold} onRoundEnd={this.setTallyUp} />;
		}
		let toggleBtn = null;
		if (this.state.wasWon) {
			toggleBtn = <button onClick={() => { this.setState({ showingCard: !this.state.showingCard }); }} className="toggle_endcard">{this.state.showingCard ? "Hide Endcard" : "Show Endcard"}</button>;
		}
		let card_container, card = null;
		if (this.state.wasWon && !this.state.showingChart) {
			card = (
				<div className="end_card">
					<h1>{`🎉 ${this.state.winner.name} has won! 🎊`}</h1>
					<h2>{`${this.state.winner.name} won after ${this.state.roundCount} rounds with a grand total of ${this.state.winner.points} points!`}</h2>
					<button onClick={() => this.setState({showingChart: true})}>Show Chart</button>
				</div>
			);
		} else {
			card = (
				<div className="end_card">
					<End_Chart players={this.state.players} roundCount={this.state.roundCount} onHideChart={() => this.setState({showingChart: false})} />
				</div>
			);
		}
		if (this.state.wasWon && this.state.showingCard)
			card_container = (
				<div className="modal_container" style={{ zIndex: "20" }}>{card}</div>
			);
		return (
			<React.Fragment>
				{toggleBtn}
				{card_container}
				{this.state.isTallying ? <TallyPanel players={this.state.players} onTallyEnd={this.sortByPosition} /> : null}
				<div>
					<h1>Scoreboard</h1>
					{panel}
					{/* {<SettingsWindow />} */}
				</div>
			</React.Fragment>
		);
	}
}

ReactDOM.render(<App />, document.body);

window.addEventListener("beforeunload", function (e) {
	var confirmationMsg = "Are you sure you want to close this Scoreboard tab? All your progress will be lost.";

	e.returnValue = confirmationMsg;
	return confirmationMsg;
});