import React from 'react';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { useTimetableStore } from '../stores/timetable';
import { useSubjectsStore } from '../stores/subjects';
import type { Database } from '../lib/database.types';

type TimetableEntry = Database['public']['Tables']['timetable_entries']['Row'];
type Subject = Database['public']['Tables']['subjects']['Row'];

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

export function Timetable() {
  const { entries, loading, error, fetchEntries, createEntry, updateEntry, deleteEntry } = useTimetableStore();
  const { subjects, fetchSubjects } = useSubjectsStore();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingEntry, setEditingEntry] = React.useState<TimetableEntry | null>(null);

  React.useEffect(() => {
    fetchEntries();
    fetchSubjects();
  }, [fetchEntries, fetchSubjects]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const entryData = {
      subject_id: formData.get('subject_id') as string,
      day_of_week: parseInt(formData.get('day_of_week') as string, 10),
      start_time: formData.get('start_time') as string,
      end_time: formData.get('end_time') as string,
    };

    try {
      if (editingEntry) {
        await updateEntry(editingEntry.id, entryData);
      } else {
        await createEntry(entryData);
      }
      setIsModalOpen(false);
      setEditingEntry(null);
    } catch (error) {
      console.error('Failed to save timetable entry:', error);
    }
  };

  const handleEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      await deleteEntry(id);
    }
  };

  const getEntriesForDayAndTime = (day: number, time: string) => {
    return entries.filter(
      entry => 
        entry.day_of_week === day && 
        entry.start_time <= time && 
        entry.end_time > time
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Timetable</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your weekly schedule
            </p>
          </div>
          <button
            onClick={() => {
              setEditingEntry(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="w-20 px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  {DAYS.map((day, index) => (
                    <th
                      key={day}
                      className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {TIME_SLOTS.map((time) => (
                  <tr key={time}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {time}
                    </td>
                    {DAYS.map((_, dayIndex) => {
                      const dayEntries = getEntriesForDayAndTime(dayIndex, time);
                      return (
                        <td
                          key={dayIndex}
                          className="px-6 py-4 whitespace-nowrap text-sm"
                        >
                          {dayEntries.map((entry) => (
                            <div
                              key={entry.id}
                              className={`rounded-md p-2 mb-1 ${
                                (entry.subject as any).type === 'LAB'
                                  ? 'bg-amber-50 border border-amber-200'
                                  : 'bg-indigo-50 border border-indigo-200'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {(entry.subject as any).name}
                                </span>
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => handleEdit(entry)}
                                    className="text-indigo-600 hover:text-indigo-900"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {entry.start_time} - {entry.end_time}
                              </div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Timetable Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleSubmit} className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                {editingEntry ? 'Edit Entry' : 'Add Entry'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="subject_id"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Subject
                  </label>
                  <select
                    name="subject_id"
                    id="subject_id"
                    required
                    defaultValue={editingEntry?.subject_id}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="">Select a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="day_of_week"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Day
                  </label>
                  <select
                    name="day_of_week"
                    id="day_of_week"
                    required
                    defaultValue={editingEntry?.day_of_week}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    {DAYS.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="start_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    id="start_time"
                    required
                    defaultValue={editingEntry?.start_time}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label
                    htmlFor="end_time"
                    className="block text-sm font-medium text-gray-700"
                  >
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    id="end_time"
                    required
                    defaultValue={editingEntry?.end_time}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingEntry(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {editingEntry ? 'Save Changes' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}