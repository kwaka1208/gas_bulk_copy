# 変数の定義を読み込み
COMMAND=clasp

# 認証
login:
	$(COMMAND) login

# スクリプトをクラウドに反映
push:
	$(COMMAND) push

# クラウドのスクリプトをローカルに取り込み
pull:
	$(COMMAND) pull

# スクリプトを開く
open:
	$(COMMAND) open-script

