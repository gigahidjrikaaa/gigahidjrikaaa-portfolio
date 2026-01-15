"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { adminApi, CertificateBase, CertificateResponse } from "@/services/api";
import CertificateForm from "./CertificateForm";

const copy = {
  title: "Certificates",
  empty: "No certificates found. Add one to get started!",
  add: "Add Certificate",
  confirmDelete: "Are you sure you want to delete this certificate?",
};

const CertificatesManagement = () => {
  const [certificates, setCertificates] = useState<CertificateResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<CertificateResponse | null>(null);

  const fetchCertificates = async () => {
    const data = await adminApi.getCertificates();
    setCertificates(data);
  };

  useEffect(() => {
    fetchCertificates().catch((error) => console.error("Failed to fetch certificates", error));
  }, []);

  const handleSave = async (payload: CertificateBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateCertificate(selected.id, payload);
        setCertificates((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
      } else {
        const created = await adminApi.createCertificate(payload);
        setCertificates((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save certificate", error);
      alert("Failed to save certificate. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteCertificate(id);
      setCertificates((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete certificate", error);
      alert("Failed to delete certificate. Please try again.");
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{copy.title}</CardTitle>
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
        {certificates.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{certificate.title}</h3>
                  <p className="text-sm text-gray-500">{certificate.issuer} {certificate.issue_date ? `• ${certificate.issue_date}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
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
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(certificate.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
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
