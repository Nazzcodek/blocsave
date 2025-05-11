import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Head from "next/head";
import Layout from "@/components/common/Layout";
import BalanceSummary from "@/components/dashboard/BalanceSummary";
import SavingsProduct from "@/components/dashboard/SavingsProducts";
import ActivityTable from "@/components/dashboard/ActivityTable";
import { fetchDashboardData } from "@/redux/slices/dashboardSlice";

const Dashboard = () => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-600">Error loading dashboard data: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard | Blocsave App</title>
      </Head>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-0.2">
            Welcome back, manage your savings
          </p>
        </div>

        <BalanceSummary />

        <SavingsProduct />

        <ActivityTable />
      </div>
    </>
  );
};

export default Dashboard;
