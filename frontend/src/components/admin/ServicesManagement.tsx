"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { adminApi, ServiceBase, ServiceResponse } from "@/services/api";
import ServiceForm from "./ServiceForm";

const copy = {
  title: "Services",
  empty: "No services found. Add one to get started!",
  add: "Add Service",
  confirmDelete: "Are you sure you want to delete this service?",
};

const ServicesManagement = () => {
  const [services, setServices] = useState<ServiceResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<ServiceResponse | null>(null);

  const fetchServices = async () => {
    const data = await adminApi.getServices();
    setServices(data);
  };

  useEffect(() => {
    fetchServices().catch((error) => console.error("Failed to fetch services", error));
  }, []);

  const handleSave = async (payload: ServiceBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateService(selected.id, payload);
        setServices((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
      } else {
        const created = await adminApi.createService(payload);
        setServices((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save service", error);
      alert("Failed to save service. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteService(id);
      setServices((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete service", error);
      alert("Failed to delete service. Please try again.");
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
        {services.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{service.title}</h3>
                  {service.subtitle ? <p className="text-sm text-gray-500">{service.subtitle}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelected(service);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {isModalOpen ? (
        <ServiceForm
          service={selected}
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

export default ServicesManagement;
