"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { adminApi, CertificateBase, CertificateResponse } from "@/services/api";
import {
  deriveCredentialStatus,
  getCertificateTypeBadgeClassName,
  getCertificateTypeLabel,
  getCredentialStatusBadgeClassName,
  getCredentialStatusLabel,
} from "@/lib/certificateMeta";
import CertificateForm from "./CertificateForm";

const copy = {
  title: "Certificates Studio",
  subtitle: "Curate professional credentials with type-aware metadata and better sorting.",
  empty: "No certificates found. Add one to get started!",
  add: "Add Certificate",
  confirmDelete: "Are you sure you want to delete this certificate?",
};

const CertificatesManagement = () => {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<CertificateResponse | null>(null);
  const [orderedCertificates, setOrderedCertificates] = useState<CertificateResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchCertificates = async () => {
    const data = await adminApi.getCertificates();
    setCertificates(data);
  };

  useEffect(() => {
    fetchCertificates().catch((error) => console.error("Failed to fetch certificates", error));
  }, []);

  useEffect(() => {
    setOrderedCertificates(certificates);
  }, [certificates]);

  const handleSave = async (payload: CertificateBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateCertificate(selected.id, payload);
        setCertificates((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
        toast({
          title: "Certificate updated",
          description: "Certificate saved successfully.",
          variant: "success",
        });
      } else {
        const created = await adminApi.createCertificate({
          ...payload,
          display_order: orderedCertificates.length,
        });
        setCertificates((prev) => [...prev, created]);
        toast({
          title: "Certificate added",
          description: "New certificate created.",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save certificate", error);
      toast({
        title: "Unable to save certificate",
        description: "Please review the fields and try again.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteCertificate(id);
      setCertificates((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Certificate deleted",
        description: "The certificate has been removed.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete certificate", error);
      toast({
        title: "Unable to delete certificate",
        description: "Please try again in a moment.",
        variant: "error",
      });
    }
  };

  const persistOrder = async (nextItems: CertificateResponse[]) => {
    setOrderedCertificates(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => adminApi.updateCertificate(item.id, { display_order: index }))
      );
      toast({
        title: "Certificate order updated",
        description: "Display order has been saved.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to reorder certificates", error);
      toast({
        title: "Unable to reorder certificates",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedCertificates.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedCertificates.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedCertificates];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next).catch(() => null);
    setDraggedId(null);
  };

  return (
    <Card className="mt-4 overflow-hidden border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4 bg-gradient-to-r from-slate-50 via-white to-slate-50">
        <div>
          <CardTitle>{copy.title}</CardTitle>
          <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
        </div>
        <Button
          onClick={() => {
            setSelected(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          {copy.add}
        </Button>
      </CardHeader>
      <CardContent>
        {orderedCertificates.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {orderedCertificates.map((certificate) => {
              const resolvedStatus = deriveCredentialStatus(certificate);

              return (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                  draggable
                  onDragStart={() => setDraggedId(certificate.id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => handleDrop(certificate.id)}
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Tooltip content="Drag to reorder">
                        <span className="cursor-grab rounded-md border border-slate-200 bg-slate-50 p-1 text-slate-400">
                          <GripVertical className="h-4 w-4" />
                        </span>
                      </Tooltip>
                      <h3 className="font-semibold text-gray-800">{certificate.title}</h3>
                      <Badge
                        variant="outline"
                        className={`rounded-full border ${getCertificateTypeBadgeClassName(
                          certificate.certificate_type
                        )}`}
                      >
                        {getCertificateTypeLabel(certificate.certificate_type, certificate.custom_type_label)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`rounded-full border ${getCredentialStatusBadgeClassName(resolvedStatus)}`}
                      >
                        {getCredentialStatusLabel(resolvedStatus)}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {certificate.issuer || "Unknown issuer"}
                      {certificate.issue_date ? ` • Issued ${certificate.issue_date}` : ""}
                      {certificate.expiry_date ? ` • Expires ${certificate.expiry_date}` : ""}
                    </p>
                    {certificate.specialization ? (
                      <p className="mt-1 text-xs text-slate-500">Track: {certificate.specialization}</p>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <Tooltip content="Edit">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelected(certificate);
                          setIsModalOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                    <Tooltip content="Delete">
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(certificate.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
      {isModalOpen ? (
        <CertificateForm
          certificate={selected}
          onSave={handleSave}
          onCancel={() => {
            setIsModalOpen(false);
            setSelected(null);
          }}
        />
      ) : null}
    </Card>
  );
};

export default CertificatesManagement;
