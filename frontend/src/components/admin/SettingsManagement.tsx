"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminApi,
  GitHubImportStatusResponse,
  GitHubImportTestResponse,
} from "@/services/api";
import { useToast } from "@/components/ui/toast";

const copy = {
  cardTitle: "GitHub Import Health",
  cardDescription:
    "Token is stored only in backend environment variables. The dashboard shows status and allows a safe connectivity check.",
  configured: "Token Configured",
  source: "Token Source",
  mode: "Authentication Mode",
  recommendation: "Recommendation",
  testButton: "Run Connectivity Test",
  testingButton: "Testing...",
  refreshStatus: "Refresh Status",
  loading: "Loading GitHub integration status...",
  statusError: "Failed to load GitHub importer status.",
  testError: "Failed to run GitHub connectivity test.",
  testSuccess: "GitHub connectivity check completed.",
  tokenPresent: "Configured",
  tokenMissing: "Not Configured",
  metricsTitle: "Rate Limit Snapshot",
  limit: "Limit",
  remaining: "Remaining",
  used: "Used",
  resetAt: "Reset At",
  noTestYet: "Run a connectivity test to see current API rate-limit metrics.",
};

const badgeClassByState = {
  good: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warn: "border-amber-200 bg-amber-50 text-amber-700",
  neutral: "border-slate-200 bg-slate-100 text-slate-700",
};

const formatUnixTime = (value?: number | null): string => {
  if (!value) return "-";
  const date = new Date(value * 1000);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const MetricTile = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{label}</p>
    <p className="mt-2 text-lg font-semibold text-slate-900">{value}</p>
  </div>
);

const SettingsManagement = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<GitHubImportStatusResponse | null>(null);
  const [testResult, setTestResult] = useState<GitHubImportTestResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const result = await adminApi.getGitHubImportStatus();
      setStatus(result);
    } catch {
      toast({ variant: "error", title: copy.statusError });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTest = async () => {
    try {
      setTesting(true);
      const result = await adminApi.testGitHubImportConnection();
      setTestResult(result);
      toast({
        variant: result.ok ? "success" : "error",
        title: result.ok ? copy.testSuccess : result.message,
      });
    } catch {
      toast({ variant: "error", title: copy.testError });
    } finally {
      setTesting(false);
    }
  };

  const tokenBadgeClass = useMemo(() => {
    if (!status) return badgeClassByState.neutral;
    return status.token_configured ? badgeClassByState.good : badgeClassByState.warn;
  }, [status]);

  const testBadgeClass = useMemo(() => {
    if (!testResult) return badgeClassByState.neutral;
    return testResult.ok ? badgeClassByState.good : badgeClassByState.warn;
  }, [testResult]);

  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="py-8">
          <p className="text-sm text-slate-500">{copy.loading}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="h-1 w-full bg-gradient-to-r from-slate-700 via-slate-900 to-slate-700" />
        <CardHeader className="space-y-2">
          <CardTitle className="text-xl text-slate-900">{copy.cardTitle}</CardTitle>
          <p className="text-sm leading-relaxed text-slate-600">{copy.cardDescription}</p>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.configured}</p>
              <span className={`mt-2 inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${tokenBadgeClass}`}>
                {status?.token_configured ? (
                  <CheckCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <ExclamationTriangleIcon className="mr-1.5 h-3.5 w-3.5" />
                )}
                {status?.token_configured ? copy.tokenPresent : copy.tokenMissing}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.source}</p>
              <p className="mt-2 inline-flex items-center text-sm font-semibold text-slate-800">
                <KeyIcon className="mr-1.5 h-4 w-4 text-slate-500" />
                {status?.token_source || "environment"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.mode}</p>
              <p className="mt-2 text-sm font-semibold capitalize text-slate-800">{status?.authentication_mode || "unauthenticated"}</p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">{copy.recommendation}</p>
            <p className="mt-2 text-sm text-slate-700">{status?.recommendation}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-2"
            >
              {testing ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ClockIcon className="h-4 w-4" />
              )}
              {testing ? copy.testingButton : copy.testButton}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={fetchStatus}
              disabled={loading}
              className="inline-flex items-center gap-2"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              {copy.refreshStatus}
            </Button>

            {testResult && (
              <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${testBadgeClass}`}>
                {testResult.ok ? (
                  <CheckCircleIcon className="mr-1.5 h-3.5 w-3.5" />
                ) : (
                  <ExclamationTriangleIcon className="mr-1.5 h-3.5 w-3.5" />
                )}
                {testResult.message}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base text-slate-900">{copy.metricsTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {!testResult ? (
            <p className="text-sm text-slate-500">{copy.noTestYet}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <MetricTile label={copy.limit} value={testResult.core_limit ?? "-"} />
              <MetricTile label={copy.remaining} value={testResult.core_remaining ?? "-"} />
              <MetricTile label={copy.used} value={testResult.core_used ?? "-"} />
              <MetricTile label={copy.resetAt} value={formatUnixTime(testResult.core_reset_at)} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsManagement;
