import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { postsApi } from '../api/endpoints.js';

export function BlogDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    postsApi
      .get(slug)
      .then(setPost)
      .catch((e) => setError(e?.response?.data?.message || 'Not found'));
  }, [slug]);

  if (error) {
    return (
      <div className="section">
        <p className="text-slate-400">{error}</p>
        <Link to="/blog" className="mt-4 inline-block">
          ← Back to blog
        </Link>
      </div>
    );
  }

  if (!post) return <div className="section text-slate-400">Loading…</div>;

  return (
    <article className="section max-w-3xl">
      <Link to="/blog" className="text-sm">
        ← Back to blog
      </Link>
      <h1 className="mt-4 text-4xl font-bold text-white">{post.title}</h1>
      <p className="mt-2 text-sm text-slate-400">
        {post.author?.name || 'Robin Nasim Hossain'} ·{' '}
        {new Date(post.publishedAt || post.createdAt).toLocaleDateString()}
      </p>
      {post.tags?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      )}
      <div className="prose prose-invert mt-8 max-w-none whitespace-pre-line leading-7 text-slate-200">
        {post.content}
      </div>
    </article>
  );
}
