"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
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
  const [orderedServices, setOrderedServices] = useState<ServiceResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchServices = async () => {
    const data = await adminApi.getServices();
    setServices(data);
  };

  useEffect(() => {
    fetchServices().catch((error) => console.error("Failed to fetch services", error));
  }, []);

  useEffect(() => {
    setOrderedServices(services);
  }, [services]);

  const handleSave = async (payload: ServiceBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateService(selected.id, payload);
        setServices((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
        toast({
          title: "Service updated",
          description: "Service saved successfully.",
          variant: "success",
        });
      } else {
        const created = await adminApi.createService({
          ...payload,
          display_order: orderedServices.length,
        });
        setServices((prev) => [...prev, created]);
        toast({
          title: "Service added",
          description: "New service created.",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save service", error);
      toast({
        title: "Unable to save service",
        description: "Please review the fields and try again.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteService(id);
      setServices((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Service deleted",
        description: "The service has been removed.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete service", error);
      toast({
        title: "Unable to delete service",
        description: "Please try again in a moment.",
        variant: "error",
      });
    }
  };

  const persistOrder = async (nextItems: ServiceResponse[]) => {
    setOrderedServices(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => adminApi.updateService(item.id, { display_order: index }))
      );
      toast({
        title: "Service order updated",
        description: "Display order has been saved.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to reorder services", error);
      toast({
        title: "Unable to reorder services",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedServices.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedServices.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedServices];
    const [moved] = next.splice(currentIndex, 1);
    next.splice(targetIndex, 0, moved);
    persistOrder(next).catch(() => null);
    setDraggedId(null);
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
        {orderedServices.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {orderedServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4"
                draggable
                onDragStart={() => setDraggedId(service.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(service.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Tooltip content="Drag to reorder">
                      <span className="cursor-grab text-slate-400">
                        <GripVertical className="h-4 w-4" />
                      </span>
                    </Tooltip>
                    <h3 className="font-semibold text-gray-800">{service.title}</h3>
                  </div>
                  {service.subtitle ? <p className="text-sm text-gray-500">{service.subtitle}</p> : null}
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit">
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
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </Tooltip>
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
