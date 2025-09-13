import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { toast } from 'react-hot-toast';
import { dataService } from '../../services/apiService';
import { SortableItem } from './SortableItem';

const PageEditor = () => {
    const [pages, setPages] = useState([]);
    const [selectedPage, setSelectedPage] = useState(null);
    const [contentBlocks, setContentBlocks] = useState([]);
    const [loading, setLoading] = useState(true);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const fetchPages = async () => {
            try {
                setLoading(true);
                const { data, error } = await dataService.getAll('pages');
                if (error) throw new Error(error.message);
                setPages(data || []);
                if (data && data.length > 0) {
                    setSelectedPage(data[0]);
                }
            } catch (error) {
                toast.error(`Error al cargar las páginas: ${error.message}`);
            } finally {
                setLoading(false);
            }
        };
        fetchPages();
    }, []);

    useEffect(() => {
        if (selectedPage) {
            setContentBlocks(selectedPage.content || []);
        }
    }, [selectedPage]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            setContentBlocks((items) => {
                const oldIndex = items.findIndex(item => item.id === active.id);
                const newIndex = items.findIndex(item => item.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    const handleSave = async () => {
        try {
            await dataService.update('pages', selectedPage.id, { content: contentBlocks });
            toast.success('Página guardada con éxito');
        } catch (error) {
            toast.error(`Error al guardar la página: ${error.message}`);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Editor de Páginas</h2>
                <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Guardar Cambios</button>
            </div>

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={contentBlocks} strategy={verticalListSortingStrategy}>
                        <div className="space-y-4">
                            {contentBlocks.map(block => (
                                <SortableItem key={block.id} id={block.id}>
                                    <div>{block.content}</div>
                                </SortableItem>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}
        </motion.div>
    );
};

export default PageEditor;
