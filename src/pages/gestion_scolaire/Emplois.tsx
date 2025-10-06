import { useState, useEffect } from 'react';
import { Clock, Plus, X } from 'lucide-react';

interface Class {
  id: string;
  name: string;
}

interface Subject {
  id: string;
  name: string;
  shortName: string;
  color: string;
}

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
}

interface ScheduleEntry {
  id: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  timeSlotId: string;
  dayOfWeek: number;
  room: string;
}

interface Teacher {
  id: string;
  firstname: string;
  lastname: string;
  classes?: string[];
  specialite?: string;
}

const EmploiDuTemps = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState<Omit<ScheduleEntry, 'id'>>({
    classId: '',
    subjectId: '',
    teacherId: '',
    timeSlotId: '',
    dayOfWeek: 0,
    room: ''
  });

  const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [classesRes, subjectsRes, timeSlotsRes, scheduleRes, teachersRes] = await Promise.all([
          fetch('http://localhost:3000/classes'),
          fetch('http://localhost:3000/subjects'),
          fetch('http://localhost:3000/timeSlots'),
          fetch('http://localhost:3000/schedule'),
          fetch('http://localhost:3000/formateurs')
        ]);
        
        if (!classesRes.ok) throw new Error('Erreur lors du chargement des classes');
        if (!subjectsRes.ok) throw new Error('Erreur lors du chargement des matières');
        if (!timeSlotsRes.ok) throw new Error('Erreur lors du chargement des créneaux horaires');
        if (!scheduleRes.ok) throw new Error('Erreur lors du chargement de l\'emploi du temps');
        if (!teachersRes.ok) throw new Error('Erreur lors du chargement des enseignants');

        const classesData = await classesRes.json();
        const subjectsData = await subjectsRes.json();
        const timeSlotsData = await timeSlotsRes.json();
        const scheduleData = await scheduleRes.json();
        const teachersData = await teachersRes.json();
        
        // Formatage des enseignants
        const formattedTeachers = teachersData.map((teacher: any) => ({
          id: teacher.id,
          firstname: teacher.firstname,
          lastname: teacher.lastname,
          classes: teacher.classes,
          specialite: teacher.specialite
        }));
        
        setClasses(classesData);
        setSubjects(subjectsData);
        setTimeSlots(timeSlotsData);
        setSchedule(scheduleData);
        setTeachers(formattedTeachers);
        
        if (classesData.length > 0) {
          setSelectedClass(classesData[0].id);
          setNewEntry(prev => ({ ...prev, classId: classesData[0].id }));
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setError(error instanceof Error ? error.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getSubjectById = (id: string) => {
    return subjects.find(subject => subject.id === id);
  };

  const getTeacherById = (id: string) => {
    return teachers.find(teacher => teacher.id === id);
  };

  const getTimeSlotById = (id: string) => {
    return timeSlots.find(slot => slot.id === id);
  };

  const getClassSchedule = (classId: string) => {
    return schedule.filter(entry => entry.classId === classId);
  };

  const getDaySchedule = (classId: string, day: number) => {
    return getClassSchedule(classId)
      .filter(entry => entry.dayOfWeek === day)
      .sort((a, b) => {
        const slotA = getTimeSlotById(a.timeSlotId);
        const slotB = getTimeSlotById(b.timeSlotId);
        return slotA && slotB ? slotA.startTime.localeCompare(slotB.startTime) : 0;
      });
  };

  const handleAddEntry = async () => {
    try {
      if (!newEntry.classId || !newEntry.subjectId || !newEntry.teacherId || !newEntry.timeSlotId) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Vérification des conflits
      const hasConflict = schedule.some(entry => 
        entry.dayOfWeek === newEntry.dayOfWeek &&
        entry.timeSlotId === newEntry.timeSlotId &&
        (entry.teacherId === newEntry.teacherId || entry.classId === newEntry.classId)
      );

      if (hasConflict) {
        throw new Error('Conflit horaire : l\'enseignant ou la classe est déjà occupé à ce créneau');
      }

      const response = await fetch('http://localhost:3000/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newEntry,
          id: `SCH-${Date.now().toString().slice(-6)}`
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'ajout du cours');
      }

      const createdEntry = await response.json();
      setSchedule([...schedule, createdEntry]);
      setShowAddModal(false);
      setNewEntry({
        classId: selectedClass || '',
        subjectId: '',
        teacherId: '',
        timeSlotId: '',
        dayOfWeek: 0,
        room: ''
      });
      setError(null);
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleDeleteEntry = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3000/schedule/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du cours');
      }

      setSchedule(schedule.filter(entry => entry.id !== id));
    } catch (err) {
      console.error('Erreur:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Erreur lors du chargement des données: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Emploi du temps</h1>
          <div className="flex items-center gap-4">
            <select
              value={selectedClass || ''}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setNewEntry(prev => ({ ...prev, classId: e.target.value }));
              }}
              className="border p-2 rounded"
              title='emploidutemps'
            >
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={!selectedClass}
            >
              <Plus size={18} /> Ajouter un cours
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        {selectedClass && (
          <div className="bg-white p-4 rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-3 text-left w-40">Créneau</th>
                  {daysOfWeek.map((day, index) => (
                    <th key={day} className="p-3 text-left">
                      <div className="flex items-center justify-between">
                        <span>{day}</span>
                        <span className="text-sm text-gray-500">
                          {new Date().getDay() - 1 === index && '(Aujourd\'hui)'}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timeSlots.map(slot => (
                  <tr key={slot.id} className="border-t">
                    <td className="p-3">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock size={16} />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                    </td>
                    {daysOfWeek.map((_, dayIndex) => {
                      const dayEntries = getDaySchedule(selectedClass, dayIndex)
                        .filter(entry => entry.timeSlotId === slot.id);
                      
                      return (
                        <td key={dayIndex} className="p-3">
                          {dayEntries.map(entry => {
                            const subject = getSubjectById(entry.subjectId);
                            const teacher = getTeacherById(entry.teacherId);
                            
                            return (
                              <div 
                                key={entry.id}
                                className="mb-2 last:mb-0 p-3 rounded border-l-4"
                                style={{ 
                                  borderLeftColor: subject?.color || '#ccc',
                                  backgroundColor: `${subject?.color}20` || 'transparent'
                                }}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium">{subject?.name || 'Matière inconnue'}</div>
                                    <div className="text-sm text-gray-600">
                                      {teacher ? `${teacher.firstname} ${teacher.lastname}` : 'Enseignant inconnu'}
                                      {teacher?.specialite && ` (${teacher.specialite})`}
                                    </div>
                                    {entry.room && (
                                      <div className="text-sm text-gray-500 mt-1">
                                        Salle: {entry.room}
                                      </div>
                                    )}
                                  </div>
                                  <button 
                                    onClick={() => handleDeleteEntry(entry.id)}
                                    className="text-red-500 hover:text-red-700"
                                    title='btn'

                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {showAddModal && selectedClass && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Ajouter un cours</h2>
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                    title='ajout'
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Classe</label>
                    <select
                      value={selectedClass}
                      disabled
                      className="border p-2 w-full rounded bg-gray-100"
                    >
                      <option value={selectedClass}>
                        {classes.find(c => c.id === selectedClass)?.name}
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Jour*</label>
                    <select
                      value={newEntry.dayOfWeek}
                      onChange={(e) => setNewEntry({...newEntry, dayOfWeek: parseInt(e.target.value)})}
                      className="border p-2 w-full rounded"
                      required
                    >
                      {daysOfWeek.map((day, index) => (
                        <option key={day} value={index}>{day}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Créneau horaire*</label>
                    <select
                      value={newEntry.timeSlotId}
                      onChange={(e) => setNewEntry({...newEntry, timeSlotId: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                    >
                      <option value="">Sélectionner un créneau</option>
                      {timeSlots.map(slot => (
                        <option key={slot.id} value={slot.id}>
                          {slot.startTime} - {slot.endTime}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Matière*</label>
                    <select
                      value={newEntry.subjectId}
                      onChange={(e) => setNewEntry({...newEntry, subjectId: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                    >
                      <option value="">Sélectionner une matière</option>
                      {subjects.map(subject => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Enseignant*</label>
                    <select
                      value={newEntry.teacherId}
                      onChange={(e) => setNewEntry({...newEntry, teacherId: e.target.value})}
                      className="border p-2 w-full rounded"
                      required
                    >
                      <option value="">Sélectionner un enseignant</option>
                      {teachers
                        .filter(teacher => 
                          teacher.classes?.includes(selectedClass) &&
                          (!newEntry.subjectId || 
                           !teacher.specialite || 
                           teacher.specialite.includes(subjects.find(s => s.id === newEntry.subjectId)?.name || ''))
                        )
                        .map(teacher => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.firstname} {teacher.lastname}
                            {teacher.specialite && ` (${teacher.specialite})`}
                          </option>
                        ))
                      }
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Salle</label>
                    <input
                      type="text"
                      value={newEntry.room}
                      onChange={(e) => setNewEntry({...newEntry, room: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Numéro de salle"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setShowAddModal(false);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddEntry}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={!newEntry.subjectId || !newEntry.teacherId || !newEntry.timeSlotId}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmploiDuTemps;