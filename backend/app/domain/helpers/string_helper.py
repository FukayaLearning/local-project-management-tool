import re

def sanitize_branch_name(name: str) -> str:
    """
    プロジェクト名をGitブランチ名として使用可能な形式にサニタイズする。
    - 空白文字をアンダーバー(_)に置換。
    - 日本語(UTF-8)は許容。
    - Gitで不正な文字（.. , ~ , ^ , : , ? , * , [ ）を置換（今回は簡易的にアンダーバーへ）。
    """
    if not name:
        return "default"
    
    # 1. 空白文字をアンダーバーに置換
    sanitized = re.sub(r'\s+', '_', name)
    
    # 2. Gitブランチ名で禁止されている制御文字や特殊記号を置換
    # 参照: https://git-scm.com/docs/git-check-ref-format
    # ここでは簡易的に、安全でない可能性がある文字をアンダーバーに置換
    # (.. , ~ , ^ , : , ? , * , [ , \ , @{ , /)
    # ※スラッシュはパス区切りとして使えるが、今回は単純化のため置換対象に含める
    sanitized = re.sub(r'[\.\.\~\^:\?\*\[\\@\{\}/]', '_', sanitized)
    
    # 3. 複数のアンダーバーを1つにまとめる
    sanitized = re.sub(r'_+', '_', sanitized)
    
    # 先頭や末尾のドットやスラッシュなども避ける
    sanitized = sanitized.strip('_').strip('.')
    
    return sanitized or "default"
