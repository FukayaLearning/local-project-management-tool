import subprocess
import os

class GitService:
    def __init__(self, repo_path: str = "."):
        # repo_path should be the root of the repo
        # assuming logic is running from backend root, so repo root is one level up (or same if backend is root? No, backend is typically subdir)
        # But here we want the PROJECT ROOT where .git is.
        # Current file: backend/app/infrastructure/git/git_service.py
        # Project root: ../../../../.. 
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
        self.repo_path = base_dir

    def _run_git(self, args: list):
        try:
            subprocess.run(
                ["git"] + args,
                cwd=self.repo_path,
                check=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        except subprocess.CalledProcessError as e:
            # Log error or re-raise
            print(f"Git command failed: {e.stderr.decode()}")
            # We might want to suppress error if it's just "nothing to commit"
            pass

    def commit(self, message: str):
        self._run_git(["add", "."])
        self._run_git(["commit", "-m", message])

    def restore(self, commit_hash: str):
        # Dangerous operation: overwrites current working directory
        self._run_git(["restore", "--source", commit_hash, "."])
