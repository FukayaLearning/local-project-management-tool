import subprocess
import os
import threading
from backend.app.domain.repositories.git_repository import IGitRepository

_git_lock = threading.Lock()


class GitService(IGitRepository):
    """プロジェクトごとに独立したGitリポジトリを管理する。

    各メソッドは project_dir を受け取り、そのディレクトリ内での
    Git操作を行う。プロジェクト間のGit履歴は完全に分離される。
    """

    def _run_git(self, args: list, project_dir: str) -> str:
        with _git_lock:
            try:
                result = subprocess.run(
                    ["git"] + args,
                    cwd=project_dir,
                    check=True,
                    capture_output=True,
                    text=True,
                )
                return result.stdout.strip()
            except subprocess.CalledProcessError as e:
                raise RuntimeError(f"Git command failed: {e.stderr.strip()}")

    def is_initialized(self, project_dir: str) -> bool:
        git_dir = os.path.join(project_dir, ".git")
        return os.path.exists(git_dir) and os.path.isdir(git_dir)

    def initialize(self, project_dir: str) -> None:
        if not os.path.exists(project_dir):
            os.makedirs(project_dir)
        self._run_git(["init", "-b", "main"], project_dir)
        self._run_git(["config", "user.name", "Local Project Manager"], project_dir)
        self._run_git(["config", "user.email", "local@example.com"], project_dir)

    def commit(self, message: str, project_dir: str) -> None:
        self._run_git(["add", "."], project_dir)
        self._run_git(["commit", "-m", message, "--allow-empty"], project_dir)

    def undo(self, project_dir: str) -> str:
        count = int(self._run_git(["rev-list", "--count", "HEAD"], project_dir))
        if count <= 1:
            raise RuntimeError("Cannot undo: No more commits to undo.")
        self._run_git(["reset", "--hard", "HEAD^"], project_dir)
        return "Undo successful"

    def redo(self, project_dir: str) -> str:
        try:
            orig_head = self._run_git(["rev-parse", "ORIG_HEAD"], project_dir)
            current_head = self._run_git(["rev-parse", "HEAD"], project_dir)
            if orig_head == current_head:
                raise RuntimeError("Cannot redo: Nothing to redo.")
            self._run_git(["reset", "--hard", "ORIG_HEAD"], project_dir)
            return "Redo successful"
        except RuntimeError:
            raise RuntimeError("Cannot redo: No previous state found.")

    def has_uncommitted_changes(self, project_dir: str) -> bool:
        output = self._run_git(["status", "--porcelain"], project_dir)
        return len(output.strip()) > 0
