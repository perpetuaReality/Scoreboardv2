import React from "react";
import ReactDOM from "react-dom";

import css from "../css/styles.css";

export default class SettingsWindow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {options: this.initialSettings};
	}

	get initialSettings() {
		const key = "scoreboard_init_options";
		const defaultVal = {
			language: "english",
			pointThreshold: 500,
			pointFloor: 0,
			defaultPlayerCount: 10,
			showsPlayerConfirm: true
		};
		
		const init = localStorage.getItem(key);
		if (init === null || init === undefined) {
			localStorage.setItem(key, defaultVal);
			return localStorage.getItem(key);
		}

		return init;
	}

	render() {
		return (
			<div className="modal_container" style={{zIndex: 20}}>
				<div className="settings_panel">
					<h1>Settings</h1>
					Language:
					<select>
						<option value="english">English</option>
						<option value="spanish">Español</option>
					</select>
				</div>
			</div>
		);
	}
}