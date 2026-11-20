#!/usr/bin/env python3
"""把行测笔记压缩成「学科提要」，供知识图谱整理时快速阅读。

用法：
    python3 scripts/build_digest.py

输出：.digest/<模块>/<科目>.md（不提交到 git）
每篇笔记保留：标题、考点速览、知识框架/方法速查、知识点标题清单、本节速记。
"""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent  # 行测知识/
OUT = Path(__file__).resolve().parent.parent / ".digest"

SECTIONS_OF_INTEREST = ("考点速览", "核心速览", "知识框架", "方法速查", "本节结构", "公式与方法速查")
TAIL_SECTIONS = ("本节速记", "速记")


def split_sections(text: str) -> list[tuple[str, str]]:
    """按二级标题切分。"""
    parts = re.split(r"(?m)^##\s+", text)
    out: list[tuple[str, str]] = []
    for part in parts[1:]:
        title, _, body = part.partition("\n")
        out.append((title.strip(), body.strip()))
    return out


def digest_file(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    # 去掉 frontmatter 与一级标题
    text = re.sub(r"(?s)^---\n.*?\n---\n", "", text)
    sections = split_sections(text)

    chunks: list[str] = []
    headings: list[str] = []
    for title, body in sections:
        clean = re.sub(r"\s+", " ", body).strip()
        if any(key in title for key in SECTIONS_OF_INTEREST):
            chunks.append(f"### {title}\n{clean[:2200]}")
        elif any(key in title for key in TAIL_SECTIONS):
            chunks.append(f"### {title}\n{clean[:900]}")
        # 收集知识点标题（2.x）
    for line in text.splitlines():
        m = re.match(r"^###\s+(2\.\d+.*)$", line.strip())
        if m:
            headings.append(f"- {m.group(1)}")

    if headings:
        chunks.append("### 知识点标题\n" + "\n".join(headings))

    return f"## {path.name}\n\n" + "\n\n".join(chunks)


def main() -> None:
    roots = [
        ROOT / "常识判断",
        ROOT / "判断推理",
        ROOT / "数量关系",
        ROOT / "资料分析",
        ROOT / "言语理解与表达",
    ]
    total = 0
    for base in roots:
        if not base.exists():
            continue
        for sub in sorted([p for p in base.iterdir() if p.is_dir() and not p.name.startswith(".")]):
            if sub.name == "视频资料":
                continue
            files = sorted([p for p in sub.glob("*.md")])
            if not files:
                continue
            out_dir = OUT / base.name
            out_dir.mkdir(parents=True, exist_ok=True)
            body = [f"# {base.name} · {sub.name}（{len(files)} 篇）\n"]
            for f in files:
                body.append(digest_file(f))
                total += 1
            (out_dir / f"{sub.name}.md").write_text("\n\n".join(body), encoding="utf-8")
            print(f"{base.name}/{sub.name}: {len(files)} 篇")

        # 顶层 md（例如数量关系直接放在根目录）
        files = sorted([p for p in base.glob("*.md")])
        if files:
            out_dir = OUT / base.name
            out_dir.mkdir(parents=True, exist_ok=True)
            body = [f"# {base.name}（{len(files)} 篇）\n"]
            for f in files:
                body.append(digest_file(f))
                total += 1
            (out_dir / "总览.md").write_text("\n\n".join(body), encoding="utf-8")
            print(f"{base.name}: {len(files)} 篇")

    print(f"done: {total} notes → {OUT}")


if __name__ == "__main__":
    main()
