// Yüklənmə placeholder-i landmark/id daşımır — bax: app/loading.tsx qeydi.
export default function WorkspaceLoading() {
  return (
    <div className="role-workspace is-loading" aria-busy="true">
      <div className="workspace-skeleton"><i /><i /><i /></div>
      <p className="sr-only" role="status">Səhifə yüklənir.</p>
    </div>
  );
}
