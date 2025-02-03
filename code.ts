figma.showUI(__html__, {
	visible: true,
	width: 500,
	height: 500,
});

interface TextInfo {
	selectionNodeName: string;
	id: string;
	text: string;
	fontName: string;
	fontWeight: string;
	fontSize: string;
	lineHeight: string;
	unit: string;
	color: string;
}

figma.ui.onmessage = (msg: { type: string }) => {
	const textInfoArray: TextInfo[] = []; // 新しい配列を作成

	if (msg.type === 'text-get') {
		const selectionNode = figma.currentPage.selection;
		if (selectionNode.length === 0) {
			figma.notify('アートボードを1つ選択してください');
			return;
		}
		if (selectionNode[0].type === 'TEXT') {
			const scssString = `font-family: "${selectionNode[0].fontName.family}";
font-weight: "${selectionNode[0].fontName.style}";
font-size: ${selectionNode[0].fontSize.toString()}px;
line-height: ${selectionNode[0].lineHeight.unit === 'AUTO' ? 'inherit' : Math.round(selectionNode[0].lineHeight.value).toString()}${(() => {
					if (selectionNode[0].lineHeight.unit === 'AUTO') {
						return '';
					} else if (selectionNode[0].lineHeight.unit === 'PERCENT') {
						return '%';
					} else {
						return 'px';
					}
				})()};
color: ${(() => {
					if (!('fills' in selectionNode[0]) || selectionNode[0].fills.length === 0) {
						return ''; // 塗りがない場合
					}
					if (selectionNode[0].fills[0]?.type === 'SOLID') {
						const fill = Object.entries(selectionNode[0].fills[0].color).map(([, v]: any) => Math.round(v * 255));
						const hexColor = `#${fill.map(v => v.toString(16).padStart(2, '0')).join('')}`; // HEX形式に変換
						return hexColor; // RGB形式で返す
					} else if (selectionNode[0].fills[0]?.type === 'GRADIENT_LINEAR') {
						const gradient = selectionNode[0].fills[0].gradientStops;
						const color: string[] = [];
						gradient.forEach((stop: any) => {
							const stopValue = Object.entries(stop.color)
								.slice(0, 3)
								.map(([, v]: any) => Math.round(v * 255));
							const hexColor = `#${stopValue.map(v => v.toString(16).padStart(2, '0')).join('')}`; // HEX形式に変換
							color.push(hexColor);
						});
						return `linear-gradient(${color.join(',')})`;
					} else {
						return ''; // SOLIDでない場合
					}
				})()};`;
			figma.ui.postMessage({ type: 'to-css', data: scssString, text: selectionNode[0].characters.toLowerCase() });
			return;
		}
		if (selectionNode[0].type !== 'FRAME') {
			figma.notify('アートボードを1つ選択してください');
			return;
		}
		const nodes = selectionNode.length > 0 ? selectionNode[0].findAll((node) => node.type === 'TEXT') : [];
		if (nodes.length === 0) {
			figma.notify('テキストがありません');
			return;
		}
		nodes.map((node: any) => {
			const textInfo: TextInfo = {
				selectionNodeName: selectionNode[0].name,
				// 各ノードの情報をオブジェクトとして作成
				id: node.id.toString(),
				text: node.characters,
				fontName: node.fontName.family,
				fontWeight: node.fontName.style,
				fontSize: node.fontSize.toString(),
				lineHeight: node.lineHeight.unit === 'AUTO' ? '自動' : Math.round(node.lineHeight.value).toString(),
				unit: (() => {
					if (node.lineHeight.unit === 'AUTO') {
						return '自動';
					} else if (node.lineHeight.unit === 'PERCENT') {
						return '%';
					} else {
						return 'px';
					}
				})(),
				color: (() => {
					if (!('fills' in node) || node.fills.length === 0) {
						return ''; // 塗りがない場合
					}
					if (node.fills[0]?.type === 'SOLID') {
						const fill = Object.entries(node.fills[0].color).map(([, v]: any) => Math.round(v * 255));
						// const rgbColor = `rgb(${fill.join(',')}`; // RGB形式で返す
						const hexColor = `#${fill.map(v => v.toString(16).padStart(2, '0')).join('')}`; // HEX形式に変換
						return hexColor; // RGB形式で返す
					} else if (node.fills[0]?.type === 'GRADIENT_LINEAR') {
						const gradient = node.fills[0].gradientStops;
						const color: string[] = [];
						gradient.forEach((stop: any) => {
							const stopValue = Object.entries(stop.color)
								.slice(0, 3)
								.map(([, v]: any) => Math.round(v * 255));
							const hexColor = `#${stopValue.map(v => v.toString(16).padStart(2, '0')).join('')}`; // HEX形式に変換
							color.push(hexColor);
						});
						return `linear-gradient(${color.join(',')})`;
					} else {
						return ''; // SOLIDでない場合
					}
				})(),
			};
			textInfoArray.push(textInfo); // 配列にオブジェクトを追加
		});
		if (textInfoArray.length === 0) {
			figma.notify('テキストがありません');
		}
		// CSVヘッダー
		const headers = ['selectionNodeName', 'id', 'text', 'fontName', 'fontWeight', 'fontSize', 'lineHeight', 'unit', 'color'];
		// CSV形式に変換
		const csvRows = [
			['アートボードの名前', 'id', 'テキスト', 'フォント', 'フォントの太さ', 'フォントのサイズ', '行間', '行間の単位', 'カラー'].join(','), // ヘッダー行
			...textInfoArray.map((row: any) =>
				headers.map((fieldName: string) =>
					JSON.stringify(row[fieldName], (_, value) => value === null ? '' : value) // nullを空文字に変換
				).join(',')
			)
		].join('\n');
		// UIにCSVデータを送信
		figma.ui.postMessage({ type: 'download-csv', data: csvRows, fileName: selectionNode[0].name });
	}

	if (msg.type === 'cancel') {
		figma.closePlugin();
	}
};
