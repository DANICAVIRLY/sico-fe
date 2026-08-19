import React from "react";

const steps = [
  {
    id: 1,
    title: "Surat Bebas Pustaka",
    key: "bebas_pustaka",
  },
  {
    id: 2,
    title: "Pengajuan Clearing",
    key: "pengajuan_clearing",
  },
  {
    id: 3,
    title: "Verifikasi Admin",
    key: "verifikasi_admin",
  },
  {
    id: 4,
    title: "Verifikasi Atasan",
    key: "verifikasi_atasan",
  },
];

const getProgressStep = (status) => {
  switch (status) {
    case "belum_bebas_pustaka":
      return 0;

    case "bebas_pustaka":
      return 1;

    case "pengajuan_clearing":
      return 2;

    case "verifikasi_admin":
      return 3;

    case "verifikasi_atasan":
      return 4;

    case "selesai":
      return 4;

    default:
      return 0;
  }
};

export default function TimelineProgress({ status = "pengajuan_clearing" }) {
  const currentStep = getProgressStep(status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-lg font-bold text-blue-800">
          Tahapan Proses Clearing
        </h2>

        <span className="text-blue-700 font-medium">
          {currentStep}/4
        </span>
      </div>

      {/* Timeline */}
      <div className="relative px-8">

        {/* Garis belakang */}
        <div className="absolute top-[20px] left-[8%] right-[8%] h-[4px] bg-gray-300 rounded-full" />

        {/* Garis progress */}
        <div
          className="absolute top-[20px] left-[8%] h-[4px] bg-blue-600 rounded-full transition-all duration-500"
          style={{
            width:
              currentStep === 0
                ? "0%"
                : `${((currentStep - 1) / (steps.length - 1)) * 84}%`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">

          {steps.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div
                key={step.id}
                className="flex flex-col items-center text-center w-1/4"
              >

                {/* Circle */}
                <div
                  className={`
                    w-10 h-10 rounded-full
                    flex items-center justify-center
                    border-2
                    transition-all duration-300
                    ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white"
                        : isActive
                        ? "bg-white border-blue-600 text-blue-600"
                        : "bg-white border-gray-300 text-gray-400"
                    }
                  `}
                >
                  {isCompleted ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M6 2h9l3 3v17H6V2zm8 1.5V6h3.5L14 3.5zM8 9h8v1.5H8V9zm0 3h8v1.5H8V12zm0 3h5v1.5H8V15z" />
                    </svg>
                  )}
                </div>

                {/* Title */}
                <p
                  className={`
                    mt-4 text-sm font-medium
                    ${
                      isCompleted || isActive
                        ? "text-gray-900"
                        : "text-gray-500"
                    }
                  `}
                >
                  {step.title}
                </p>

                {/* Status */}
                <p className="mt-1 text-xs">
                  {isCompleted && (
                    <span className="text-blue-600">
                      Selesai
                    </span>
                  )}

                  {isActive && (
                    <span className="text-blue-600 font-medium">
                      Sedang diproses
                    </span>
                  )}

                  {!isCompleted && !isActive && (
                    <span className="text-gray-400">
                      Belum
                    </span>
                  )}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}