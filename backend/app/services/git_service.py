import subprocess
import os
from typing import Optional, List

class GitService:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir

    def _run_git(self, args: List[str]) -> str:
        """Gitコマンドを実行し、標準出力を返す。エラー時はRuntimeErrorを送出。"""
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.data_dir,
                capture_output=True,
                text=True,
                check=True
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Git command failed: {e.stderr.strip()}")

    def is_initialized(self) -> bool:
        """Gitリポジトリが初期化されているか確認する"""
        git_dir = os.path.join(self.data_dir, ".git")
        return os.path.exists(git_dir) and os.path.isdir(git_dir)

    def initialize(self) -> None:
        """Gitリポジトリを初期化し、空のコミットを作成する"""
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        
        self._run_git(["init"])
        self._run_git(["config", "user.name", "Local Project Manager"])
        self._run_git(["config", "user.email", "local@example.com"])
        self._run_git(["commit", "--allow-empty", "-m", "Initial commit"])

    def get_current_branch(self) -> str:
        """現在のブランチ名を取得する"""
        return self._run_git(["branch", "--show-current"])

    def create_branch(self, branch_name: str) -> None:
        """新しいブランチを作成し、チェックアウトする"""
        # mainブランチが存在することを確認し、なければ作成（初期化直後など）
        branches = self._run_git(["branch"]).split('\n')
        has_main = any('main' in b for b in branches)
        
        if not has_main:
             # 現在がmainでないならmain rename、あるいはmasterならrename
             current = self.get_current_branch()
             if current == 'master':
                 self._run_git(["branch", "-m", "master", "main"])
        
        # mainから分岐するために一度mainにcheckoutする（必要であれば）
        # ただし、現状の運用では「プロジェクト作成 = 新規ブランチ」なので
        # 現在のHEADから分岐する形になる。
        # 明示的にmainから分岐したい場合は `git checkout main` -> `git pull` 等が必要だが
        # ローカルツールなので、現在の状態（おそらく何もデータがない、あるいはテンプレートがある状態）から分岐とする。
        
        self._run_git(["checkout", "-b", branch_name])

    def checkout_branch(self, branch_name: str) -> None:
        """指定したブランチに切り替える"""
        self._run_git(["checkout", branch_name])

    def get_branches(self) -> List[str]:
        """ブランチ一覧を取得する"""
        output = self._run_git(["branch", "--format=%(refname:short)"])
        return output.split('\n') if output else []

    def commit(self, message: str) -> None:
        """変更をステージングし、コミットする"""
        self._run_git(["add", "."])
        # 変更がない場合はコミットしない（エラー回避）
        status = self._run_git(["status", "--porcelain"])
        if status:
            self._run_git(["commit", "-m", message])

    def undo(self) -> str:
        """直前のコミットを取り消す（HEAD^にリセットし、ファイルを復元）"""
        # Reset current HEAD to HEAD^, updating index and working tree
        # 今回の要件では「履歴を戻す」動作。
        # 単純な `git revert` だと履歴が汚れるため、`git reset --hard HEAD^` を採用するか、
        # あるいは `git restore` で特定コミットの状態にするか。
        # ここでは「操作の取り消し」として、HEADを一つ戻す（破壊的変更）を採用する。
        # ※注意: 共有リポジトリではないのでforce update的な挙動でも許容されると判断。
        # 安全側に倒すなら `git revert HEAD` だが、ローカルツールとしての「Undo」感（なかったことにする）を優先。
        
        # まずコミットが2つ以上あるか確認（Initial commitは消せない）
        count = int(self._run_git(["rev-list", "--count", "HEAD"]))
        if count <= 1:
             raise RuntimeError("Cannot undo: No more commits to undo.")

        # リセット前に現在のHEADを保存（Redo用）
        # Redoを実装するには、単なるreset --hardだと情報が消える。
        # Gitのreflogを使うか、独自のRedoスタックを持つ必要がある。
        # ここでは `git reset --keep HEAD^` を使いつつ、`ORIG_HEAD` を利用してRedo可能にするアプローチをとる。
        
        self._run_git(["reset", "--hard", "HEAD^"])
        return "Undo successful"

    def redo(self) -> str:
        """取り消した操作をやり直す（ORIG_HEADに戻す）"""
        # ORIG_HEAD が現在のHEADと違う場合のみ実行可能
        try:
            orig_head = self._run_git(["rev-parse", "ORIG_HEAD"])
            current_head = self._run_git(["rev-parse", "HEAD"])
            
            if orig_head == current_head:
                raise RuntimeError("Cannot redo: Nothing to redo.")
                
            self._run_git(["reset", "--hard", "ORIG_HEAD"])
            return "Redo successful"
        except RuntimeError:
             raise RuntimeError("Cannot redo: No previous state found.")
