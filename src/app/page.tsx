/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "react-toastify";
interface PortDetail {
  port: number;
  protocol: string;
  service: string;
  usage: string;
}

interface ScanSummary {
  targetInformation: {
    host: string;
    ipAddress: string;
    nmapVersion: string;
    scanYear: number;
  };
  commandExecuted: string;
  betterCommandSuggestion: string;
}

interface SecurityAnalysis {
  assessment: Record<string, string>;
  servicePatching: Record<string, string>;
  accessControl: Record<string, string>;
  systemMonitoring: Record<string, string>;
  additionalScans: Record<string, string>;
}

interface ScanResult {
  scanSummary: ScanSummary;
  identifiedPorts: {
    portDetails: PortDetail[];
  };
  securityAnalysis: SecurityAnalysis;
  recommendations: Record<string, string>;
}

// Update the state to use the ScanResult interface

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [imageSrc, setImageSrc] = useState("");
  const [scanStarted, setScanStarted] = useState(false);

  // Event handlers
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      handleFileUpload(event.dataTransfer.files[0]);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (selectedFile: File) => {
    setFile(selectedFile);
    setImageSrc(""); // Clear any existing image on the UI.

    try {
      const base64 = await toBase64(selectedFile);
      setImageSrc(base64 as string); // Show preview of the image.
    } catch (error) {
      console.error("Error during file conversion:", error);
      toast("Error during file conversion.");
    }
  };

  const toBase64 = (file: File) =>
    new Promise<string | ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handleScan = async () => {
    if (!file) {
      toast.warn("Please upload an image first.", {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        theme: "dark",
      });
      return;
    }

    toast.promise(
      new Promise(async (resolve, reject) => {
        setIsLoading(true);
        setScanStarted(true);

        try {
          const base64 = await toBase64(file);
          setImageSrc(base64 as string);

          const payload = JSON.stringify({ photo: base64 });
          const response = await fetch("/api/vision", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
          });

          if (response.ok) {
            const scanResult: ScanResult = await response.json();
            setResult(scanResult);
            resolve(scanResult);
          } else {
            reject(new Error("Failed to process the scan"));
          }
        } catch (error) {
          console.error("Error during file upload:", error);
          reject(new Error("Error during scanning"));
        } finally {
          setIsLoading(false);
        }
      }),
      {
        pending: "Scanning...",
        success: "Scan complete!",
        error: "Error occurred during scanning.",
      },
      {
        position: "top-center",
        theme: "dark",
      },
    );
  };

  const dragOverClass = dragging
    ? "border-green-500 bg-gray-700"
    : "border-gray-400";

  const UploadArea = () => {
    return (
      <>
        {!imageSrc ? (
          <div
            className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-24 ${dragOverClass}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file")?.click()}
          >
            <input
              type="file"
              accept="image/*"
              name="file"
              id="file"
              className="hidden"
              onChange={handleChange}
            />
            <label
              htmlFor="file"
              className="cursor-pointer text-sm text-green-400 hover:text-green-600"
            >
              <span className="mt-2 text-center text-sm leading-normal">
                Click to upload or drag and drop
              </span>
              <p className="text-center text-xs">PNG, JPG, GIF up to 10MB</p>
            </label>
          </div>
        ) : (
          <img
            src={imageSrc}
            alt="Uploaded"
            className="h-auto max-w-full rounded border-2 border-green-300"
          />
        )}

        <button
          onClick={handleScan}
          className={`mt-4 flex w-full items-center justify-center rounded-lg bg-green-600 p-2 font-semibold text-white transition-colors hover:bg-green-700`}
          disabled={isLoading}
        >
          Analyze Scan
        </button>
      </>
    );
  };

  // Helper function to format the keys from camelCase to Title Case
  function formatKey(key: string): string {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/[_]/g, " ");
  }

  // Function type for rendering analysis rows
  type RenderAnalysisRow = (
    key: string,
    value: string,
    index: number,
  ) => JSX.Element;

  // Helper function to render each row of the analysis
  const renderAnalysisRow: RenderAnalysisRow = (key, value, index) => {
    return (
      <div
        key={key}
        className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
      >
        <dt className="text-sm font-medium text-gray-500">{formatKey(key)}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
          {value}
        </dd>
      </div>
    );
  };

  const ResultArea = () => {
    return (
      <div className="relative flex flex-col place-items-center justify-center gap-4">
        <div className="flex-1">
          <img
            src={imageSrc}
            alt="Uploaded"
            className="h-auto max-w-full rounded-lg border-2 border-green-300"
          />
          {isLoading && (
            <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center rounded-lg bg-black bg-opacity-50">
              <svg className="pulsating-circle" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="white"
                  className="pulse"
                ></circle>
              </svg>
            </div>
          )}
        </div>
        {!isLoading && result && (
          <div className="mt-4 text-left">
            <h3 className="text-lg font-semibold text-gray-100">
              Nmap Scan Analysis Result:
            </h3>
            <div className="mt-2">
              <div className="overflow-hidden rounded-md border-2 border-zinc-200 bg-white shadow">
                {/* Scan Summary Section */}
                <div className="border-t border-gray-200">
                  <h3 className="px-4 py-5 text-lg font-medium leading-6 text-gray-900">
                    Scan Summary
                  </h3>
                  <dl className="sm:grid sm:grid-cols-3 sm:gap-4">
                    <div className="bg-gray-50 px-4 py-5 sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Host
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        {result.scanSummary.targetInformation.host}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        IP Address
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        {result.scanSummary.targetInformation.ipAddress}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">
                        Nmap Version
                      </dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                        {result.scanSummary.targetInformation.nmapVersion}
                      </dd>
                    </div>
                  </dl>
                  <div className="bg-white px-4 py-5 sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">
                      Command Executed
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {result.scanSummary.commandExecuted}
                    </dd>
                  </div>

                  {/* Better Command Suggestion */}
                  <div className="bg-gray-50 px-4 py-5 sm:col-span-3">
                    <dt className="text-sm font-medium text-gray-500">
                      Better Command Suggestion
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0">
                      {result.scanSummary.betterCommandSuggestion}
                    </dd>
                  </div>
                </div>
                {/* Identified Ports Section */}
                <div className="border-t border-gray-200">
                  <h3 className="px-4 py-5 text-lg font-medium leading-6 text-gray-900">
                    Identified Ports
                  </h3>
                  <dl>
                    {result.identifiedPorts.portDetails.map((detail, index) => (
                      <div
                        key={index}
                        className={`${
                          index % 2 === 0 ? "bg-gray-50" : "bg-white"
                        } px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}
                      >
                        <dt className="text-sm font-medium text-gray-500">
                          Port {detail.port} ({detail.protocol})
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                          {detail.service} - {detail.usage}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {/* Security Analysis Section */}
                <div className="border-t border-gray-200">
                  <h3 className="px-4 py-5 text-lg font-medium leading-6 text-gray-900">
                    Security Analysis
                  </h3>
                  <dl>
                    {/* Assessment */}
                    {Object.entries(result.securityAnalysis.assessment).map(
                      ([key, value], index) =>
                        renderAnalysisRow(key, value, index),
                    )}

                    {/* Service Patching */}
                    {Object.entries(
                      result.securityAnalysis.servicePatching,
                    ).map(([key, value], index) =>
                      renderAnalysisRow(key, value, index),
                    )}

                    {/* Access Control */}
                    {Object.entries(result.securityAnalysis.accessControl).map(
                      ([key, value], index) =>
                        renderAnalysisRow(key, value, index),
                    )}

                    {/* System Monitoring */}
                    {Object.entries(
                      result.securityAnalysis.systemMonitoring,
                    ).map(([key, value], index) =>
                      renderAnalysisRow(key, value, index),
                    )}

                    {/* Additional Scans */}
                    {Object.entries(
                      result.securityAnalysis.additionalScans,
                    ).map(([key, value], index) =>
                      renderAnalysisRow(key, value, index),
                    )}
                  </dl>
                </div>

                {/* Recommendations Section */}
                <div className="border-t border-gray-200">
                  <h3 className="px-4 py-5 text-lg font-medium leading-6 text-gray-900">
                    Recommendations
                  </h3>
                  <dl>
                    {Object.entries(result.recommendations).map(
                      ([key, value], index) =>
                        renderAnalysisRow(key, value, index),
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col justify-center p-4">
      <div className={`mx-auto ${scanStarted ? "max-w-5xl" : "max-w-xl"}`}>
        <header className="mb-4 text-center">
          <h2 className="sr-only text-2xl font-bold text-green-500">
            👨‍💻 NmapVision
          </h2>
          <img
            src={"/logo.png"}
            alt="NmapVision Logo"
            className="mx-auto mt-6 h-16 w-16"
          />
        </header>

        <div className="rounded-lg p-8">
          <h1 className="mb-4 text-center text-xl font-bold tracking-tight text-green-400">
            Let AI analyze your nmap scans! 👁️
          </h1>
          <p className="text-bold mb-4 text-center text-green-200">
            NmapVision is a tool to analyze your nmap scans and give you a
            detailed analysis on it!
          </p>

          <div className="rounded-lg p-8">
            {!scanStarted && UploadArea()}
            {scanStarted && ResultArea()}
          </div>
          <p className="text-bold 2 px-8 text-center text-green-200">
            Powered by OpenAI&apos;s API's for GPT-4-Vision and GPT-4-Turbo's
            JSON Mode.
          </p>
          <footer className="text-center text-green-200">
            Copyright © 2023{" "}
            <Link href={`https://za16.fyi`}>Zaid Mukaddam</Link>
          </footer>
        </div>
      </div>
    </div>
  );
}
