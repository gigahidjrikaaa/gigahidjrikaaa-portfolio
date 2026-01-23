"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import Tooltip from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/toast";
import { adminApi, AwardBase, AwardResponse } from "@/services/api";
import AwardForm from "./AwardForm";

const copy = {
  title: "Awards",
  empty: "No awards found. Add one to get started!",
  add: "Add Award",
  confirmDelete: "Are you sure you want to delete this award?",
};

const AwardsManagement = () => {
  const [awards, setAwards] = useState<AwardResponse[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<AwardResponse | null>(null);
  const [orderedAwards, setOrderedAwards] = useState<AwardResponse[]>([]);
  const [draggedId, setDraggedId] = useState<number | null>(null);
  const { toast } = useToast();

  const fetchAwards = async () => {
    const data = await adminApi.getAwards();
    setAwards(data);
  };

  useEffect(() => {
    fetchAwards().catch((error) => console.error("Failed to fetch awards", error));
  }, []);

  useEffect(() => {
    setOrderedAwards(awards);
  }, [awards]);

  const handleSave = async (payload: AwardBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateAward(selected.id, payload);
        setAwards((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
        toast({
          title: "Award updated",
          description: "Award saved successfully.",
          variant: "success",
        });
      } else {
        const created = await adminApi.createAward({
          ...payload,
          display_order: orderedAwards.length,
        });
        setAwards((prev) => [...prev, created]);
        toast({
          title: "Award added",
          description: "New award created.",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save award", error);
      toast({
        title: "Unable to save award",
        description: "Please review the fields and try again.",
        variant: "error",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteAward(id);
      setAwards((prev) => prev.filter((item) => item.id !== id));
      toast({
        title: "Award deleted",
        description: "The award has been removed.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to delete award", error);
      toast({
        title: "Unable to delete award",
        description: "Please try again in a moment.",
        variant: "error",
      });
    }
  };

  const persistOrder = async (nextItems: AwardResponse[]) => {
    setOrderedAwards(nextItems);
    try {
      await Promise.all(
        nextItems.map((item, index) => adminApi.updateAward(item.id, { display_order: index }))
      );
      toast({
        title: "Award order updated",
        description: "Display order has been saved.",
        variant: "success",
      });
    } catch (error) {
      console.error("Failed to reorder awards", error);
      toast({
        title: "Unable to reorder awards",
        description: "Please try again.",
        variant: "error",
      });
    }
  };

  const handleDrop = (targetId: number) => {
    if (draggedId === null || draggedId === targetId) return;
    const currentIndex = orderedAwards.findIndex((item) => item.id === draggedId);
    const targetIndex = orderedAwards.findIndex((item) => item.id === targetId);
    if (currentIndex === -1 || targetIndex === -1) return;
    const next = [...orderedAwards];
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
        {orderedAwards.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {orderedAwards.map((award) => (
              <div
                key={award.id}
                className="flex items-center justify-between gap-4 rounded-lg border bg-gray-50 p-4"
                draggable
                onDragStart={() => setDraggedId(award.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(award.id)}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Tooltip content="Drag to reorder">
                      <span className="cursor-grab text-slate-400">
                        <GripVertical className="h-4 w-4" />
                      </span>
                    </Tooltip>
                    <h3 className="font-semibold text-gray-800">{award.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{award.issuer} {award.award_date ? `• ${award.award_date}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip content="Edit">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelected(award);
                        setIsModalOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(award.id)}>
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
        <AwardForm
          award={selected}
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

export default AwardsManagement;
