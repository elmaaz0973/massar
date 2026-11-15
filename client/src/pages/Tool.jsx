import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { findTool } from '../tools/registry.js';
import NotFound from './NotFound.jsx';

export default function Tool() {
  const { toolSlug } = useParams();
  const tool = findTool(toolSlug);
  if (!tool) return <NotFound />;
  const { Component } = tool;

  return (
    <>
      <p className="crumbs"><Link to="/">الرئيسية</Link> / <Link to="/tools">الأدوات</Link> / {tool.title}</p>
      <div className="tool-head">
        {tool.icon && <img src={tool.icon} alt="" width="72" height="64" />}
        <h1>{tool.title}</h1>
      </div>
      <p className="muted">{tool.description}</p>
      <Suspense fallback={<p className="state">جارٍ تحميل الأداة…</p>}>
        <Component />
      </Suspense>
    </>
  );
}
