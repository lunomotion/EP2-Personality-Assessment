'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getReportByEmail } from '@/lib/mock-data';
import type { ReportData } from '@/types/report';
import {
  ReportHeader,
  LoadingSpinner,
  AnimalSection,
  RiskRewardSection,
  DriverSection,
  AOISection,
  StrategySection,
  SectionTitle,
  WhatsNext,
} from '@/components';

export function ReportContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const isPrintMode = searchParams.get('print') === 'true';

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    if (!email) return;

    setDownloadingPdf(true);
    try {
      const response = await fetch(`/api/report/pdf?email=${encodeURIComponent(email)}`);

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EP2-Report-${email.split('@')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      alert('Failed to download PDF. Please try printing instead.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  useEffect(() => {
    async function fetchReport() {
      if (!email) {
        setError('No email provided. Please check your link.');
        setLoading(false);
        return;
      }

      try {
        const data = await getReportByEmail(email);
        if (data) {
          setReportData(data);
        } else {
          setError('Report not found. Please complete the assessment first.');
        }
      } catch {
        setError('Failed to load report. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, [email]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen ep-gradient flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-8 shadow-2xl text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Unable to Load Report
          </h2>
          <p className="text-gray-600">
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!reportData) {
    return null;
  }

  return (
    <div className={`min-h-screen ${isPrintMode ? 'print-mode' : 'ep-gradient py-8 px-4'}`}>
      <div className={isPrintMode ? '' : 'max-w-4xl mx-auto relative z-10'}>
        {/* Action Buttons - hidden in print mode */}
        {!isPrintMode && (
          <div className="flex justify-end gap-3 mb-4 no-print">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={downloadingPdf}
              className="flex items-center gap-2 px-4 py-2 bg-ep-purple text-white rounded-lg shadow hover:bg-ep-blue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloadingPdf ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full loading-spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download PDF
                </>
              )}
            </button>
          </div>
        )}

        {/* Page 1: Header + Introduction + Entrepreneur Type */}
        <div className="pdf-page page-break-after">
          <div className="pdf-page-content">
            <ReportHeader />

            {/* Introduction */}
            <p className="text-gray-600 text-center mb-8">
              This report outlines your entrepreneur personality type and potential entrepreneurial opportunity
              that best fit your unique personality, based on your results of the EP2 Assessment.
            </p>

            {/* Your Entrepreneur Type Section */}
            <SectionTitle>Your Entrepreneur Type</SectionTitle>
            <AnimalSection
              animalType={reportData.animalType}
              personalityTitle={reportData.personalityTitle}
              personalityText={reportData.personalityText}
              traits={reportData.traits}
            />
          </div>
          <div className="gradient-stripe" />
        </div>

        {/* Page 2: Risk & Reward Profile */}
        <div className="pdf-page page-break-after">
          <div className="pdf-page-content">
            <SectionTitle>Risk &amp; Reward Profile</SectionTitle>
            <RiskRewardSection
              riskLevel={reportData.riskLevel}
              riskText={reportData.riskText}
              rewardLevel={reportData.rewardLevel}
              rewardText={reportData.rewardText}
            />
          </div>
          <div className="gradient-stripe" />
        </div>

        {/* Page 3: Entrepreneurial Driver + Area of Interest */}
        <div className="pdf-page page-break-after">
          <div className="pdf-page-content">
            {/* Entrepreneurial Driver Section */}
            <SectionTitle>Your Entrepreneurial Driver</SectionTitle>
            <DriverSection
              driverKey={reportData.driverKey}
              driverTitle={reportData.driverTitle}
              driverDescription={reportData.driverDescription}
              driverQuestions={reportData.driverQuestions}
            />

            {/* Area of Interest Section */}
            <div className="mt-8">
              <SectionTitle>Area of Interest</SectionTitle>
              <AOISection
                aoiKey={reportData.aoi1Key}
                aoiTitle={reportData.aoi1Title}
                aoiDescription={reportData.aoi1Description}
                aoiBusinesses={reportData.aoi1Businesses}
              />
            </div>
          </div>
          <div className="gradient-stripe" />
        </div>

        {/* Page 4: Business Strategy + What's Next + Footer */}
        <div className="pdf-page">
          <div className="pdf-page-content">
            {/* Business Strategy Section */}
            <SectionTitle>Your Business Strategy</SectionTitle>
            <StrategySection
              strategyKey={reportData.strategyKey}
              strategyTitle={reportData.strategyTitle}
              strategyDescription={reportData.strategyDescription}
              strategyActions={reportData.strategyActions}
            />

            {/* What's Next Section */}
            <div className="mt-8">
              <WhatsNext />
            </div>

            {/* Footer */}
            <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-gray-500 text-sm">
              <p>Report generated on {reportData.reportDate}</p>
            </footer>
          </div>
          <div className="gradient-stripe" />
        </div>
      </div>
    </div>
  );
}
