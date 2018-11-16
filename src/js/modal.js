import React from "react";
import ReactDOM from "react-dom";

import css from "../css/modal.css";

const ModalTypes = Object.freeze({
	INFO: 1, CONFIRM: 2, WARN: 3, ERROR: 4, PROMPT: 5
});

class ModalOptions {
	constructor(isOpen, modalType, message, onAccept, onCancel) {
		const isOpenFalse = (isOpen == undefined || isOpen == false);
		this.isOpen = isOpenFalse ? false : isOpen;
		this.modalType = isOpenFalse ? null : modalType;
		this.message = isOpenFalse ? null : message;
		this.onAccept = isOpenFalse ? null : onAccept;
		this.onCancel = isOpenFalse ? null : onCancel;
	}
}

class ModalDialog extends React.Component {
	constructor(props) {
		super(props);
		this.state = { input: "" };
		this.handleChange = this.handleChange.bind(this);
	}

	componentDidUpdate() {
		if (this.props.modalOptions.modalType == ModalTypes.PROMPT) {
			this.prompt.focus();
		} else {
			if(this.okBtn != undefined) this.okBtn.focus();
		}
	}

	handleChange(e) {
		this.setState({ input: e.target.value });
	}

	render() {
		if (!this.props.modalOptions.isOpen) { return null; }

		let symbol = null;
		switch (this.props.modalOptions.modalType) {
		case ModalTypes.CONFIRM:
			symbol = "❓";
			break;
		case ModalTypes.ERROR:
			symbol = "🚫";
			break;
		case ModalTypes.INFO:
			symbol = "❗";
			break;
		case ModalTypes.PROMPT:
			symbol = "✏️";
			break;
		case ModalTypes.WARN:
			symbol = "⚠️";
			break;
		default:
			break;
		}

		let acceptBtn, cancelBtn, input = null;
		let okAction = this.props.modalOptions.onAccept;
		if (this.props.modalOptions.modalType == ModalTypes.PROMPT) {
			input = <input ref={input => this.prompt = input} onChange={this.handleChange}></input>;
			okAction = () => { this.props.modalOptions.onAccept(this.state.input); };
		}
		if (this.props.modalOptions.onAccept != null) {
			acceptBtn = <button ref={btn => this.okBtn = btn} onClick={okAction}>Ok</button>;
		}
		if (this.props.modalOptions.onCancel != null)
			cancelBtn = <button onClick={this.props.modalOptions.onCancel}>Cancel</button>;
		return (
			<div className="modal_container" style={{ zIndex: 42 }}>
				<div className="modal_dialog" onKeyPress={(e) => { if (e.key == "Enter") this.okBtn.click(); }} tabIndex="-1">
					<table><tbody>
						<tr className="modal_body">
							<td className="modal_symbol">{symbol}</td>
							<td className="modal_message">{this.props.modalOptions.message}<br />{input}</td>
						</tr>
						<tr className="modal_tray">
							<td colSpan="2">{acceptBtn} {cancelBtn}</td>
						</tr>
					</tbody></table>
				</div>
			</div>
		);
	}
}

export { ModalTypes, ModalOptions, ModalDialog };