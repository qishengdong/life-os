/**
 * GitHub Contents API helper · 用于 CMS 发布按钮提交文件到 repo
 *
 * 工作流:
 *   1. 读当前文件的 sha (GET /repos/.../contents/{path})
 *   2. PUT /repos/.../contents/{path} 带新内容 + sha → 提交
 *   3. Vercel 检测到 push, auto-deploy (2-3 min)
 *
 * 环境变量:
 *   GITHUB_TOKEN — fine-grained PAT, repo: qishengdong/life-os, contents: read+write
 *   GITHUB_REPO — 默认 qishengdong/life-os (可覆盖)
 *   GITHUB_BRANCH — 默认 main
 */

const REPO = process.env.GITHUB_REPO || 'qishengdong/life-os';
const BRANCH = process.env.GITHUB_BRANCH || 'main';

interface CommitArgs {
  path: string;           // repo 内文件路径, e.g. "lib/content/data/home.json"
  content: string;        // 新文件内容 (string, 不是 base64)
  message: string;        // commit message
}

interface CommitResult {
  commitSha: string;
  commitUrl: string;
  fileUrl: string;
}

/**
 * Commit a file to the repo via GitHub Contents API.
 * Throws on error (no token, GitHub 4xx/5xx, network).
 */
export async function commitFileToGitHub(args: CommitArgs): Promise<CommitResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error('GITHUB_TOKEN env var not configured');

  const url = `https://api.github.com/repos/${REPO}/contents/${args.path}`;

  // 1. Get current sha (required for PUT)
  let currentSha: string | undefined;
  try {
    const getRes = await fetch(`${url}?ref=${BRANCH}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });
    if (getRes.ok) {
      const data = (await getRes.json()) as { sha?: string };
      currentSha = data.sha;
    } else if (getRes.status === 404) {
      currentSha = undefined; // new file
    } else {
      throw new Error(`GitHub GET failed: HTTP ${getRes.status}`);
    }
  } catch (e: any) {
    throw new Error(`Failed to fetch current sha: ${e.message}`);
  }

  // 2. PUT new content
  const contentB64 = Buffer.from(args.content, 'utf8').toString('base64');
  const putBody: Record<string, any> = {
    message: args.message,
    content: contentB64,
    branch: BRANCH,
    committer: {
      name: 'KEY CMS',
      email: 'cms@keypoint.life',
    },
  };
  if (currentSha) putBody.sha = currentSha;

  const putRes = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(putBody),
  });

  if (!putRes.ok) {
    const errText = await putRes.text();
    throw new Error(`GitHub PUT failed: HTTP ${putRes.status} — ${errText.slice(0, 200)}`);
  }

  const result = (await putRes.json()) as {
    commit: { sha: string; html_url: string };
    content: { html_url: string };
  };

  return {
    commitSha: result.commit.sha,
    commitUrl: result.commit.html_url,
    fileUrl: result.content.html_url,
  };
}
