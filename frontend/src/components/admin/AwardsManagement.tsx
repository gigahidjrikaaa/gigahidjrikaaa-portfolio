"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
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

  const fetchAwards = async () => {
    const data = await adminApi.getAwards();
    setAwards(data);
  };

  useEffect(() => {
    fetchAwards().catch((error) => console.error("Failed to fetch awards", error));
  }, []);

  const handleSave = async (payload: AwardBase) => {
    try {
      if (selected) {
        const updated = await adminApi.updateAward(selected.id, payload);
        setAwards((prev) => prev.map((item) => (item.id === selected.id ? updated : item)));
      } else {
        const created = await adminApi.createAward(payload);
        setAwards((prev) => [...prev, created]);
      }
      setIsModalOpen(false);
      setSelected(null);
    } catch (error) {
      console.error("Failed to save award", error);
      alert("Failed to save award. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(copy.confirmDelete)) return;
    try {
      await adminApi.deleteAward(id);
      setAwards((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Failed to delete award", error);
      alert("Failed to delete award. Please try again.");
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
        {awards.length === 0 ? (
          <p className="text-center text-gray-500">{copy.empty}</p>
        ) : (
          <div className="space-y-4">
            {awards.map((award) => (
              <div key={award.id} className="flex items-center justify-between rounded-lg border bg-gray-50 p-4">
                <div>
                  <h3 className="font-semibold text-gray-800">{award.title}</h3>
                  <p className="text-sm text-gray-500">{award.issuer} {award.award_date ? `• ${award.award_date}` : ""}</p>
                </div>
                <div className="flex items-center gap-2">
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
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(award.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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
