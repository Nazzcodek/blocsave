import React from "react";

const TransactionHistory = () => {
  const transactions = [
    {
      id: 1,
      type: "Adashe",
      user: "James",
      address: "0xE78235......764FF930d00",
      week: "Week 1",
      date: "May 1, 2024, 04:30pm",
      amount: -100,
    },
    {
      id: 2,
      type: "Adashe",
      user: "Dave",
      address: "0xE78235......764FF930d00",
      week: "Week 1",
      date: "May 1, 2024, 04:30pm",
      amount: -100,
    },
    {
      id: 3,
      type: "Adashe",
      user: "Mic",
      address: "0xE78235......764FF930d00",
      week: "Week 1",
      date: "May 1, 2024, 04:30pm",
      amount: -100,
    },
    {
      id: 4,
      type: "Payout W-1",
      user: "James",
      address: "0xE78235......764FF930d00",
      week: "Week 1",
      date: "May 1, 2024, 04:30pm",
      amount: 500,
    },
  ];

  return (
    <div>
      <h2 className="text-[16px] font-semibold">Transaction History</h2>
      <p className="text-gray-600 text-[12px] mb-4">
        All contributions and payouts for this group
      </p>

      <div className="overflow-x-auto rounded-lg shadow-sm border border-1">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Week
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 tracking-wider">
                Date
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 tracking-wider">
                Amount
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                        transaction.type.startsWith("Payout")
                          ? "bg-green-100"
                          : "bg-green-200"
                      }`}
                    >
                      {transaction.type.startsWith("Payout") ? (
                        <img
                          src="icons/money-send.svg"
                          alt="payout"
                          className="w-4 h-4"
                        />
                      ) : (
                        <img
                          src="/icons/adashe_green.svg"
                          alt="memeber"
                          className="w-4 h-4"
                        />
                      )}
                    </div>
                    <span className="text-[10px]  font-medium text-gray-900">
                      {transaction.type}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src="/icons/user.svg"
                      alt="user"
                      className="w-4 h-4 rounded-full mr-2"
                    />
                    <span className="text-[10px]  text-gray-900">
                      {transaction.user}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-[10px] text-gray-900">
                  {transaction.address}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-[10px]  text-gray-900">
                  {transaction.week}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-[10px]  text-gray-900">
                  {transaction.date}
                </td>
                <td
                  className={`px-4 py-4 whitespace-nowrap text-[10px] font-medium text-right ${
                    transaction.amount > 0 ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : "-"}$
                  {Math.abs(transaction.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionHistory;
