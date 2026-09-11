const Dashboard = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-4">Dashboard Overview</h2>
      <div className="grid grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">Total Activities</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">12</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
