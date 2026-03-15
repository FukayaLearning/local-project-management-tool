import subprocess
import os
from typing import List

# Default data directory name, same as used by TaskFileRepository and SettingsFileRepository
DEFAULT_DATA_DIR = "data"


class GitService:
    """タスクデータ専用のGitリポジトリを管理する。
    
    プロジェクトのソースコードリポジトリとは完全に分離し、
    タスクデータ（tasks.csv, settings.jsonなど）が保存される
    データディレクトリ内にGitリポジトリを作成・管理する。
    """

    def __init__(self, data_dir: str = ""):
        if data_dir:
            self.data_dir = data_dir
        else:
            project_root = os.path.dirname(
                os.path.dirname(
                    os.path.dirname(
                        os.path.dirname(os.path.abspath(__file__))
                    )
                )
            )
            self.data_dir = os.path.join(project_root, DEFAULT_DATA_DIR)

    def _run_git(self, args: list) -> str:
        try:
            result = subprocess.run(
                ["git"] + args,
                cwd=self.data_dir,
                check=True,
                capture_output=True,
                text=True,
            )
            return result.stdout.strip()
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Git command failed: {e.stderr.strip()}")

    def is_initialized(self) -> bool:
        git_dir = os.path.join(self.data_dir, ".git")
        return os.path.exists(git_dir) and os.path.isdir(git_dir)

    def initialize(self) -> None:
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        self._run_git(["init"])
        self._run_git(["config", "user.name", "Local Project Manager"])
        self._run_git(["config", "user.email", "local@example.com"])
        self._run_git(["commit", "--allow-empty", "-m", "Initial commit"])

    def get_current_branch(self) -> str:
        return self._run_git(["branch", "--show-current"])

    def create_branch(self, branch_name: str) -> None:
        branches = self.get_branches()
        if "main" not in branches:
            current = self.get_current_branch()
            if current == "master":
                self._run_git(["branch", "-m", "master", "main"])
        self._run_git(["checkout", "-b", branch_name])

    def checkout_branch(self, branch_name: str) -> None:
        self._run_git(["checkout", branch_name])

    def get_branches(self) -> List[str]:
        output = self._run_git(["branch", "--format=%(refname:short)"])
        return [b for b in output.split("\n") if b] if output else []

    def commit(self, message: str) -> None:
        self._run_git(["add", "."])
        self._run_git(["commit", "-m", message, "--allow-empty"])

    def undo(self) -> str:
        count = int(self._run_git(["rev-list", "--count", "HEAD"]))
        if count <= 1:
            raise RuntimeError("Cannot undo: No more commits to undo.")
        self._run_git(["reset", "--hard", "HEAD^"])
        return "Undo successful"

    def redo(self) -> str:
        try:
            orig_head = self._run_git(["rev-parse", "ORIG_HEAD"])
            current_head = self._run_git(["rev-parse", "HEAD"])
            if orig_head == current_head:
                raise RuntimeError("Cannot redo: Nothing to redo.")
            self._run_git(["reset", "--hard", "ORIG_HEAD"])
            return "Redo successful"
        except RuntimeError:
            raise RuntimeError("Cannot redo: No previous state found.")

    def restore(self, commit_hash: str) -> None:
        self._run_git(["restore", "--source", commit_hash, "."])
