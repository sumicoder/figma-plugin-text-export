# figma-plugin-text-export

Figma のテキスト情報を抜き出すプラグインです

## 導入方法

1. リポジトリから zip ダウンロード
2. 適当なディレクトリに保存、解凍
3. Figma のプラグインタブから「マニフェストからインポート」を選択
4. 解凍したフォルダ内の`manifest.json`を選択
5. 「TextExport」というプラグインを使用する

## 使用方法

### 1 つのテキストのみを選択

テキスト要素を 1 つのみ選択した状態で「取得する」を押すと、

-   テキストの文字列
-   フォントやサイズなどの css

がテキストエリアに入るのでコピペして使用する

### アートボードを選択

ページ単位で取得したい場合

アートボード（厳密には Frame）要素を選択した状態で「取得する」を押すと

-   選択されたアートボード（Frame）以下にあるテキスト要素全ての情報+α を取得
    -   アートボードの名前 - id
    -   テキスト
    -   フォント
    -   ウエイト
    -   フォントサイズ
    -   行間
    -   行間の単位（px、%）
    -   カラー
-   取得した情報を csv でダウンロード

ダウンロードされた csv ファイルをスプレッドシートにインポートすることでシートに一覧として反映させることが可能

## 免責事項

本サービスの利用により発生した損害について、当社は責任を負わないものとします。
