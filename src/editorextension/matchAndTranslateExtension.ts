import { ViewUpdate, EditorView, PluginValue } from '@codemirror/view';
import { Match } from './types';
import TranslateInline from 'main';
import { Transaction } from '@codemirror/state';
import { Language } from 'providers';

export class MatchAndTranslateExtension implements PluginValue {
	private plugin: TranslateInline;
	private cursorPos: number = 0;
	constructor(view: EditorView, plugin: TranslateInline) {
		this.plugin = plugin;
	}
	private _potentialTranslation: Match | null = null;
	public get potentialTranslation(): Match | null {
		return this._potentialTranslation;
	}

	public set potentialTranslation(value: Match | null) {
		this._potentialTranslation = value;
		if (value === null) {
			this.plugin.resetStatusBar();
		} else {
			this.presentTranslationMatchState(value);
		}
	}

	update(update: ViewUpdate) {
		// Logic:
		// On each update:
		// First check if its an update on the focused note. This prevents bugs where the same note is open in multiple tabs.
		// If there is a potential match:
		//  	- If the document has changed, chracters were inserted or deleted and therefore the potential match bounds need to be updated.
		//		- If the cursor moved outside the potential match, resolve the match and clear the potential match.
		// 		- If the cursor is still inside the potential match, extract the translation parameters and update the potential match.
		// If there is no potential match:
		//		- If the document has changed, simply check if new brackets have been added.
		//		- If the selection has changed, check the surroundings for brackets.
		if (!update.view.hasFocus) {
			return;
		}
		this.cursorPos = update.view.state.selection.main.head;
		if (this.potentialTranslation !== null) {
			let updatedPotentialTranslation;
			if (update.docChanged) {
				updatedPotentialTranslation = this.updatePotentialMatchBounds(update, this.potentialTranslation);
			} else {
				updatedPotentialTranslation = this.potentialTranslation;
			}
			if (
				this.cursorPos <= updatedPotentialTranslation.startIdx ||
				this.cursorPos >= updatedPotentialTranslation.endIdx
			) {
				this.resolveTranslationMatch(update, updatedPotentialTranslation);
				// We're not waiting for the translation to resolve, becasue this might trigger a new update and we dont want to resolve the same match twice.
				this.potentialTranslation = null;
			} else {
				if (update.docChanged) {
					this.potentialTranslation = this.extractTranslationParameters(update, updatedPotentialTranslation);
				}
			}
		} else if (update.docChanged) {
			let newSquareBracketMatch;
			update.transactions.forEach(tr => {
				newSquareBracketMatch = this.detectSquareBrackets(tr, update.view);
				if (newSquareBracketMatch !== null) {
					this.potentialTranslation = newSquareBracketMatch;
					return;
				}
			});
		} else if (update.selectionSet) {
			this.potentialTranslation = this.searchSurroundingsForSquareBrackets(update.view);
			if (this.potentialTranslation !== null) {
				this.potentialTranslation = this.extractTranslationParameters(update, this.potentialTranslation);
			}
		}
	}

	updatePotentialMatchBounds(update: ViewUpdate, potentialTranslation: NonNullable<Match>): Match {
		update.transactions.forEach(tr => {
			tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
				if (fromA >= potentialTranslation!.startIdx && toA <= potentialTranslation!.endIdx) {
					potentialTranslation!.endIdx += inserted.length - (toA - fromA);
				}
			});
		});
		return potentialTranslation;
	}

	detectSquareBrackets(tr: Transaction, view: EditorView): Match | null {
		let matchResult: Match | null = null;
		tr.changes.iterChanges((fromA, toA, fromB, toB, inserted) => {
			if (matchResult === null) {
				// Only search if no match has been found yet
				const insertedText = inserted.toString();
				if (insertedText.includes('[]')) {
					// Assuming this.cursorPos is correctly maintained elsewhere
					matchResult = {
						startIdx: this.cursorPos - 1,
						endIdx: this.cursorPos + 1,
						fromLanguageCode: null,
						toLanguageCode: null,
						text: null
					};
				}
			}
		});
		return matchResult;
	}

	searchSurroundingsForSquareBrackets(view: EditorView): Match | null {
		const doc = view.state.doc.toString();
		const limit = 10;
		let leftBracketPos: number | null = null;
		let rightBracketPos: number | null = null;
		// Iterate up to the limit to find the nearest '[' to the left and ']' to the right
		for (let i = 1; i <= limit; i++) {
			// Look for opening bracket to the left if not found yet
			if (leftBracketPos === null && this.cursorPos - i >= 0 && doc.charAt(this.cursorPos - i) === '[') {
				leftBracketPos = this.cursorPos - i;
				// Check to the right of this bracket for a closing match without encountering another opening bracket
				for (let j = leftBracketPos + 1; j < doc.length; j++) {
					if (doc.charAt(j) === ']') {
						// check if closing bracket is to the right of the current cursor position. Else it "this would [be a] ma|tch"
						rightBracketPos = j >= this.cursorPos ? j : null;
						break;
					} else if (doc.charAt(j) === '[') {
						// Found another opening bracket before a closing one, invalidating the search
						leftBracketPos = null;
						break;
					}
				}
				break;
			}

			// Look for closing bracket to the right if not found yet
			if (rightBracketPos === null && this.cursorPos + i < doc.length && doc.charAt(this.cursorPos + i) === ']') {
				rightBracketPos = this.cursorPos + i;
				// Scan to the left for the corresponding opening bracket, ensuring no closing bracket is found first
				for (let j = rightBracketPos - 1; j >= 0; j--) {
					if (doc.charAt(j) === '[') {
						// check if opening bracket is to the left of the current cursor position. Else it "this would | be [a match]"
						leftBracketPos = j > this.cursorPos ? null : j;
						break;
					} else if (doc.charAt(j) === ']') {
						// If a closing bracket is found before an opening bracket, invalidate the brackets
						rightBracketPos = null;
						break;
					}
				}
				break;
			}
		}
		// If both brackets are found, extract the content between them
		if (leftBracketPos !== null && rightBracketPos !== null) {
			return {
				startIdx: leftBracketPos,
				endIdx: rightBracketPos + 1,
				fromLanguageCode: null,
				toLanguageCode: null,
				text: null
			};
		}

		return null;
	}

	extractTranslationParameters(update: ViewUpdate, potentialTranslation: Match): Match | null {
		const textBetweenBrackets = update.view.state.sliceDoc(
			potentialTranslation.startIdx + 1,
			potentialTranslation.endIdx - 1
		);
		const parts = textBetweenBrackets.split('>');
		let fromLanguage, toLanguage, text;
		if (parts.length === 1) {
			//  [somestuff]
			// isValid = false;
			text = null;
		} else if (parts.length === 2) {
			// Could be [fromLanguage>text]  or [>text]
			if (textBetweenBrackets.startsWith('>')) {
				// [>text]
				text = parts[1];
				fromLanguage = undefined;
				toLanguage = undefined;
			} else {
				// [fromLanguage>text]
				[fromLanguage, text] = parts;
				toLanguage = undefined;
			}
		} else if (parts.length === 3) {
			// [fromLanguage>toLanguage>text] or [>toLanguage>text]
			// isValid = true;
			if (textBetweenBrackets.startsWith('>')) {
				// [>toLanguage>text]
				toLanguage = parts[1];
				text = parts[2];
				fromLanguage = undefined;
			} else {
				// [fromLanguage>toLanguage>text]
				[fromLanguage, toLanguage, text] = parts;
			}
		} else if (parts.length > 3) {
			return null;
		}

		potentialTranslation.fromLanguageCode =
			fromLanguage?.toUpperCase() || this.plugin.currentProvider.settings.fromLanguageCode;
		potentialTranslation.toLanguageCode =
			toLanguage?.toUpperCase() || this.plugin.currentProvider.settings.toLanguageCode;
		potentialTranslation.text = text || null;
		return potentialTranslation;
	}

	async presentTranslationMatchState(match: Match) {
		const textValid = this.textValid(match.text);
		if (!textValid) {
			// Syntax is invalid, might be a link or something else
			this.plugin.statusBar.updateStatusBarSection('fromLang', { clsModifier: 'warning' });
			this.plugin.statusBar.updateStatusBarSection('toLang', { clsModifier: 'warning' });
		} else {
			const supportedLanguages = await this.plugin.currentProvider.getSupportedLanguages();
			const fromVaild = this.languageCodeValid(match.fromLanguageCode, supportedLanguages.fromLanguages);
			const toValid = this.languageCodeValid(match.toLanguageCode, supportedLanguages.toLanguages);

			if (!fromVaild) {
				// Syntax is valid, but fromLanguageCode is not valid for the current provider
				// Shorten the invalid fromLanguageCode to 3 characters to fit in the status bar
				this.plugin.statusBar.updateStatusBarSection('fromLang', {
					content: match.fromLanguageCode!.substring(0, 3),
					clsModifier: 'error'
				});
			} else {
				// Syntax is valid and fromLanguageCode is valid
				this.plugin.statusBar.updateStatusBarSection('fromLang', {
					content: match.fromLanguageCode!,
					clsModifier: 'success'
				});
			}

			if (!toValid) {
				// Syntax is valid, but toLanguageCode is not valid for the current provider
				this.plugin.statusBar.updateStatusBarSection('toLang', {
					content: match.toLanguageCode!.substring(0, 3),
					clsModifier: 'error'
				});
			} else {
				// Syntax is valid and toLanguageCode is valid
				this.plugin.statusBar.updateStatusBarSection('toLang', {
					content: match.toLanguageCode!,
					clsModifier: 'success'
				});
			}
		}
	}

	textValid(text: string | null) {
		return text !== null && text.length > 0;
	}

	languageCodeValid(languageCode: string | null, allowedLanguages: Language[]) {
		return languageCode !== null && allowedLanguages.some(l => l.code === languageCode);
	}

	async resolveTranslationMatch(update: ViewUpdate, match: Match) {
		if (!this.textValid(match.text)) {
			return;
		}
		const supportedLanguages = await this.plugin.currentProvider.getSupportedLanguages();
		if (!this.languageCodeValid(match.fromLanguageCode, supportedLanguages.fromLanguages)) {
			return;
		}
		if (!this.languageCodeValid(match.toLanguageCode, supportedLanguages.toLanguages)) {
			return;
		}

		const translation = await this.plugin.currentProvider.translate(
			match.text!,
			match.fromLanguageCode!,
			match.toLanguageCode!
		);
		let output = '';
		if (translation.success === false) {
			if (translation.errorMessage) {
				output = translation.errorMessage;
			} else {
				output = 'An error occurred while translating the text';
			}
		} else {
			// TODO: This is not really a good way to handle this cause we dont have a contract that result is set when success is true, but it im tired.
			output = translation.result!;
		}
		const transaction = update.view.state.update({
			changes: { from: match.startIdx, to: match.endIdx, insert: output }
		});
		update.view.dispatch(transaction);
	}
}
