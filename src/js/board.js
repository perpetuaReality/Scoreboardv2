import React from "react";
import ReactDOM from "react-dom";

import css from "../css/styles.css";

const widthMultiplier = 1.5;
var barAnim = "none";

class ScoreDisplay extends React.Component {
	constructor(props){
		super(props);
	}

	render() {
		const player = this.props.player;
		const minimumWidth = 30;
		let pointBarColor = null;

		if (player.points < minimumWidth) {
			pointBarColor = "black";
		} else {
			pointBarColor = player.isLight ? "black" : "white";
		}
		var pointBarStyle = {
			width: (player.points * widthMultiplier) + "px",
			backgroundColor: player.colour,
			color: pointBarColor,
			animationName: barAnim
		};
		var tagStyle = {
			backgroundColor: player.colour,
			color: player.isLight ? "black" : "white",
			width: "auto"
		};

		return (
			<tr>
				<td className="nametag" style={tagStyle}>
					#{player.position}&nbsp;&nbsp;{player.name}
				</td>
				<td style={{ minWidth: this.props.pointThreshold * widthMultiplier, padding: 0 }} colSpan={3}>
					<div className="points_bar" style={pointBarStyle}>{player.points}</div>
				</td>
			</tr>
		);
	}
}

export default class Scoreboard extends React.Component {
	constructor(props) {
		super(props);
	}

	componentDidUpdate() {
		barAnim = (barAnim == "none") ? "" : "none";
	}

	render() {
		const pointThreshold = this.props.pointThreshold;
		return (
			<React.Fragment>
				<h2>Round #{this.props.roundCount}</h2>
				<table className="scoreboard">
					<tbody>
						<tr>
							<td style={{ width: 0 }}></td>
							<td style={{ width: pointThreshold * widthMultiplier - 2 }}></td>
							<td><div className={"threshold"}>{pointThreshold}</div></td>
							<td></td>
						</tr>
						{this.props.players.map(player => <ScoreDisplay key={player.colour} player={player} pointThreshold={pointThreshold}onUpdate={this.displayUpdate} />)}
					</tbody>
				</table>
				<button onClick={this.props.onRoundEnd}>🏁 End Round</button>
			</React.Fragment>
		);
	}
}