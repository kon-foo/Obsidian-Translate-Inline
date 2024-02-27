import TranslateInline from 'main';

export type StatusManagerOptions = {
	icon?: string;
	divider?: string;
	useDividers?: boolean;
};

export type StatusBarSectionOptions = {
	content?: string;
	clsModifier?: string | null;
};

export default class StatusBarManager {
	plugin: TranslateInline;
	statusBar: HTMLElement;
	sections: Map<string, HTMLElement> = new Map();

	private icon: string;
	private divider: string | undefined;

	constructor(plugin: TranslateInline, options: StatusManagerOptions = {}) {
		const { icon = '', divider } = options;
		this.icon = icon;
		this.divider = divider;

		this.plugin = plugin;

		this.statusBar = plugin.addStatusBarItem();
		this.statusBar.createEl('span', { text: this.icon, cls: 'statusbar__icon' });
	}

	addStatusBarSection(id: string, content: string, clsModifier: string | null = null) {
		// If there is already a section and if a divider is set, add a divider section
		if (this.divider && this.sections.size > 0) {
			this.statusBar.createEl('span', { text: this.divider, cls: 'statusbar__divider' });
		}

		const cls = `statusbar__section--${clsModifier || 'neutral'}`;
		const newSection = this.statusBar.createEl('span', {
			text: content,
			cls: cls,
			attr: { id: `statusbar__section--${id}` }
		});
		this.sections.set(id, newSection);
	}

	updateStatusBarSection(id: string, options: StatusBarSectionOptions) {
		const { content, clsModifier } = options;
		const section = this.sections.get(id);
		if (section) {
			if (content) {
				section.innerText = content;
			}
			if (clsModifier) {
				section.className = `statusbar__section--${clsModifier}`;
			}
		}
	}
}
