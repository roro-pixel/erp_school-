import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Users, User, Home, Mail, Phone, Book, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

interface Family {
  id: number;
  familyName: string;
  address: string;
  phone: string;
  email: string;
  students?: Student[];
  parents?: Parent[];
}

interface FamilyRequest {
  familyName: string;
  address: string;
  phone: string;
  email: string;
}

interface Parent {
  id: number;
  firstname: string;
  lastname: string;
  relationship: Relationship;
  profession?: string;
  phone: string;
  email?: string;
  familyId: number;
}

interface ParentRequest {
  firstname: string;
  lastname: string;
  familyId: number;
  relationship: Relationship;
  phone: string;
  profession?: string;
  email?: string;
}

enum Relationship {
  Mother = 'Mother',
  Father = 'Father',
  GrandFather = 'GrandFather',
  GrandMother = 'GrandMother',
  Guardian = 'Guardian',
  Uncle = 'Uncle',
  Aunt = 'Aunt',
  StepFather = 'StepFather',
  StepMother = 'StepMother',
  Brother = 'Brother',
  Sister = 'Sister',
  Cousin = 'Cousin',
  OTHER = 'OTHER'
}

interface Student {
  id: number;
  firstname: string;
  lastname: string;
  dateOfBirth: string;
  gender: string;
  classes: string; 
  familyId: number;
  parentId: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;

const FamilyDashboard = () => {
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFamily, setExpandedFamily] = useState<number | null>(null);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState<number | null>(null);
  
  const [newFamily, setNewFamily] = useState<FamilyRequest>({ 
    familyName: '', 
    address: '', 
    phone: '', 
    email: '' 
  });

  const [newParent, setNewParent] = useState<ParentRequest>({
    firstname: '',
    lastname: '',
    familyId: 0,
    relationship: Relationship.Father,
    phone: '',
    profession: '',
    email: ''
  });

  // Récupérer toutes les familles
  const fetchFamilies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/families/all`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setFamilies(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des familles';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Créer un nouveau parent
  const createParent = async (parentData: ParentRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/parents/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(parentData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newParent = await response.json();
      
      // Mettre à jour la famille avec le nouveau parent
      setFamilies(families.map(family => 
        family.id === parentData.familyId 
          ? { ...family, parents: [...(family.parents || []), newParent] }
          : family
      ));
      
      toast.success(`Parent ${newParent.firstname} ${newParent.lastname} ajouté avec succès !`);
      return newParent;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du parent';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  // Validation du nom (lettres, espaces, apostrophes uniquement)
  const validateName = (name: string): boolean => {
    const nameRegex = /^[\p{L}]+([''\s]?[\p{L}]+)*$/u;
    return nameRegex.test(name);
  };

  // Validation du téléphone congolais
  const validatePhone = (phone: string): boolean => {
    const phoneRegex = /^(0[456]\d{7})$/;
    return phoneRegex.test(phone);
  };

  // Validation de l'email
  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Email optionnel
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  };

  // Obtenir le libellé français de la relation
  const getRelationshipLabel = (relationship: Relationship): string => {
    const labels: Record<Relationship, string> = {
      [Relationship.Mother]: 'Mère',
      [Relationship.Father]: 'Père',
      [Relationship.GrandFather]: 'Grand-père',
      [Relationship.GrandMother]: 'Grand-mère',
      [Relationship.Guardian]: 'Tuteur/Tutrice',
      [Relationship.Uncle]: 'Oncle',
      [Relationship.Aunt]: 'Tante',
      [Relationship.StepFather]: 'Beau-père',
      [Relationship.StepMother]: 'Belle-mère',
      [Relationship.Brother]: 'Frère',
      [Relationship.Sister]: 'Sœur',
      [Relationship.Cousin]: 'Cousin/Cousine',
      [Relationship.OTHER]: 'Autre'
    };
    return labels[relationship] || relationship;
  };

  const createFamily = async (familyData: FamilyRequest) => {
    try {
      const response = await fetch(`${API_BASE_URL}/v1/families`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(familyData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const newFamily = await response.json();
      setFamilies([...families, newFamily]);
      toast.success(`Famille ${newFamily.familyName} créée avec succès !`);
      return newFamily;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la famille';
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      throw new Error(errorMessage);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Charger seulement les familles
        await fetchFamilies();
        
      } catch (error) {
        console.error("Erreur de chargement:", error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setError(errorMessage);
        toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredFamilies = families.filter(family => {
    const matchesSearch = family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         family.phone.includes(searchTerm) ||
                         family.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getParentsForFamily = (family: Family): Parent[] => {
    return family.parents || [];
  };

  const getStudentsForFamily = (family: Family): Student[] => {
    return family.students || [];
  };

  const toggleExpandFamily = (familyId: number) => {
    setExpandedFamily(expandedFamily === familyId ? null : familyId);
  };

  const handleAddFamily = async () => {
    // Validation côté client
    if (!newFamily.familyName.trim() || !newFamily.phone.trim()) {
      setError('Veuillez remplir tous les champs obligatoires');
      toast.error('Désolé, veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!validatePhone(newFamily.phone)) {
      setError('Le numéro de téléphone doit être au format congolais (04, 05 ou 06 suivi de 7 chiffres)');
      toast.error('Désolé, le numéro de téléphone doit être au format congolais (04, 05 ou 06 suivi de 7 chiffres)');
      return;
    }

    if (newFamily.email && !validateEmail(newFamily.email)) {
      setError('Format d\'email invalide');
      toast.error('Désolé, format d\'email invalide');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createFamily({
        familyName: newFamily.familyName.trim(),
        address: newFamily.address.trim(),
        phone: newFamily.phone.trim(),
        email: newFamily.email.trim()
      });

      setShowAddFamilyModal(false);
      setNewFamily({ familyName: '', address: '', phone: '', email: '' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la famille';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddParent = async () => {
    // Déterminer l'ID de famille à utiliser
    const familyId = selectedFamilyId || newParent.familyId;
    
    // Validation côté client
    if (!newParent.firstname.trim() || !newParent.lastname.trim() || !newParent.phone.trim() || !familyId) {
      setError('Veuillez remplir tous les champs obligatoires');
      toast.error('Désolé, veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!validateName(newParent.firstname.trim())) {
      setError('Le prénom ne doit contenir que des lettres, espaces et apostrophes');
      toast.error('Désolé, le prénom ne doit contenir que des lettres, espaces et apostrophes');
      return;
    }

    if (!validateName(newParent.lastname.trim())) {
      setError('Le nom ne doit contenir que des lettres, espaces et apostrophes');
      toast.error('Désolé, le nom ne doit contenir que des lettres, espaces et apostrophes');
      return;
    }

    if (!validatePhone(newParent.phone)) {
      setError('Le numéro de téléphone doit être au format congolais (04, 05 ou 06 suivi de 7 chiffres)');
      toast.error('Désolé, le numéro de téléphone doit être au format congolais (04, 05 ou 06 suivi de 7 chiffres)');
      return;
    }

    if (newParent.email && !validateEmail(newParent.email)) {
      setError('Format d\'email invalide');
      toast.error('Désolé, format d\'email invalide');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createParent({
        firstname: newParent.firstname.trim(),
        lastname: newParent.lastname.trim(),
        familyId: familyId,
        relationship: newParent.relationship,
        phone: newParent.phone.trim(),
        profession: newParent.profession?.trim() || undefined,
        email: newParent.email?.trim() || undefined
      });

      setShowAddParentModal(false);
      setNewParent({
        firstname: '',
        lastname: '',
        familyId: 0,
        relationship: Relationship.Father,
        phone: '',
        profession: '',
        email: ''
      });
      setSelectedFamilyId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du parent';
      setError(errorMessage);
      toast.error(`Désolé, ${errorMessage.toLowerCase()}`);
    } finally {
      setSubmitting(false);
    }
  };

  const openAddParentModal = (familyId: number) => {
    setSelectedFamilyId(familyId);
    setNewParent({
      ...newParent,
      familyId: familyId
    });
    setShowAddParentModal(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Familles</h1>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setSelectedFamilyId(null);
                setShowAddParentModal(true);
              }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              <Plus size={18} /> Ajouter un parent
            </button>
            <button 
              onClick={() => setShowAddFamilyModal(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              <Plus size={18} /> Ajouter une famille
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Rechercher par nom de famille, téléphone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-4 py-2 border rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFamilies.length > 0 ? (
                filteredFamilies.map(family => {
                  const familyParents = getParentsForFamily(family);
                  const familyStudents = getStudentsForFamily(family);
                  const isExpanded = expandedFamily === family.id;

                  return (
                    <div key={family.id} className="border rounded-lg overflow-hidden">
                      <div 
                        className="flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 cursor-pointer"
                        onClick={() => toggleExpandFamily(family.id)}
                      >
                        <div className="flex items-center gap-4">
                          <Home className="text-blue-600" size={20} />
                          <div>
                            <h3 className="font-bold text-lg">{family.familyName}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              <span>{family.phone}</span>
                              {family.email && (
                                <>
                                  <Mail size={14} />
                                  <span>{family.email}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User size={16} />
                            <span>{familyParents.length} parent{familyParents.length !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users size={16} />
                            <span>{familyStudents.length} élève{familyStudents.length !== 1 ? 's' : ''}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronUp className="text-gray-500" />
                          ) : (
                            <ChevronDown className="text-gray-500" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 bg-white">
                          {/* Section Adresse */}
                          <div className="mb-6">
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Home size={18} className="text-blue-600" />
                              Adresse de la famille
                            </h4>
                            <p className="text-gray-700">{family.address || 'Aucune adresse renseignée'}</p>
                          </div>

                          {/* Section Parents */}
                          <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium flex items-center gap-2">
                                <User size={18} className="text-blue-600" />
                                Parents ({familyParents.length})
                              </h4>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openAddParentModal(family.id);
                                }}
                                className="flex items-center gap-1 text-sm bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                              >
                                <Plus size={14} /> Ajouter parent
                              </button>
                            </div>
                            {familyParents.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {familyParents.map(parent => (
                                  <div key={parent.id} className="border rounded-lg p-4">
                                    <div className="font-medium">
                                      {parent.firstname} {parent.lastname}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {getRelationshipLabel(parent.relationship)}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                      <Phone size={14} />
                                      <span>{parent.phone}</span>
                                    </div>
                                    {parent.email && (
                                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                        <Mail size={14} />
                                        <span>{parent.email}</span>
                                      </div>
                                    )}
                                    {parent.profession && (
                                      <div className="text-sm text-gray-600 mt-1">
                                        Profession: {parent.profession}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">Aucun parent enregistré</p>
                            )}
                          </div>

                          {/* Section Élèves */}
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Users size={18} className="text-blue-600" />
                              Élèves ({familyStudents.length})
                            </h4>
                            {familyStudents.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {familyStudents.map(student => (
                                  <div key={student.id} className="border rounded-lg p-4">
                                    <div className="font-medium">
                                      {student.firstname} {student.lastname}
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                      {student.gender === 'male' ? 'Garçon' : 'Fille'} • 
                                      Né(e) le {new Date(student.dateOfBirth).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                                      <Book size={14} />
                                      <span>{student.classes || 'Classe inconnue'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-500 italic">Aucun élève enregistré</p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucune famille trouvée
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal pour ajouter une famille */}
        {showAddFamilyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Ajouter une nouvelle famille</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block mb-1 font-medium">Nom de famille*</label>
                    <input
                      type="text"
                      value={newFamily.familyName}
                      onChange={(e) => setNewFamily({...newFamily, familyName: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: FAMILLE DUPONT"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Adresse</label>
                    <input
                      type="text"
                      value={newFamily.address}
                      onChange={(e) => setNewFamily({...newFamily, address: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Adresse complète"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Téléphone*</label>
                    <input
                      type="tel"
                      value={newFamily.phone}
                      onChange={(e) => setNewFamily({...newFamily, phone: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Numéro de téléphone principal"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={newFamily.email}
                      onChange={(e) => setNewFamily({...newFamily, email: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Email principal"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setShowAddFamilyModal(false);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddFamily}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting || !newFamily.familyName || !newFamily.phone}
                  >
                    {submitting ? 'En cours...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal pour ajouter un parent */}
        {showAddParentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Ajouter un parent</h2>
                {selectedFamilyId && (
                  <p className="text-gray-600 mb-4">
                    Famille: {families.find(f => f.id === selectedFamilyId)?.familyName}
                  </p>
                )}
                
                <div className="space-y-4">
                  {/* Sélecteur de famille si pas pré-sélectionnée */}
                  {!selectedFamilyId && (
                    <div>
                      <label className="block mb-1 font-medium">Famille*</label>
                      <select
                        value={newParent.familyId || ''}
                        onChange={(e) => setNewParent({...newParent, familyId: parseInt(e.target.value)})}
                        className="border p-2 w-full rounded"
                        required
                        disabled={submitting}
                      >
                        <option value="">Sélectionner une famille</option>
                        {families.map(family => (
                          <option key={family.id} value={family.id}>
                            {family.familyName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block mb-1 font-medium">Prénom*</label>
                      <input
                        type="text"
                        value={newParent.firstname}
                        onChange={(e) => setNewParent({...newParent, firstname: e.target.value})}
                        className="border p-2 w-full rounded"
                        placeholder="Prénom"
                        required
                        disabled={submitting}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Nom*</label>
                      <input
                        type="text"
                        value={newParent.lastname}
                        onChange={(e) => setNewParent({...newParent, lastname: e.target.value})}
                        className="border p-2 w-full rounded"
                        placeholder="Nom"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Relation*</label>
                    <select
                      value={newParent.relationship}
                      onChange={(e) => setNewParent({...newParent, relationship: e.target.value as Relationship})}
                      className="border p-2 w-full rounded"
                      required
                      disabled={submitting}
                    >
                      {Object.values(Relationship).map(rel => (
                        <option key={rel} value={rel}>
                          {getRelationshipLabel(rel)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Téléphone*</label>
                    <input
                      type="tel"
                      value={newParent.phone}
                      onChange={(e) => setNewParent({...newParent, phone: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Ex: 061234567 (04, 05 ou 06)"
                      required
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Profession</label>
                    <input
                      type="text"
                      value={newParent.profession}
                      onChange={(e) => setNewParent({...newParent, profession: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Profession"
                      disabled={submitting}
                    />
                  </div>

                  <div>
                    <label className="block mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={newParent.email}
                      onChange={(e) => setNewParent({...newParent, email: e.target.value})}
                      className="border p-2 w-full rounded"
                      placeholder="Email"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button 
                    onClick={() => {
                      setShowAddParentModal(false);
                      setSelectedFamilyId(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    disabled={submitting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleAddParent}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={submitting || !newParent.firstname || !newParent.lastname || !newParent.phone || (!selectedFamilyId && !newParent.familyId)}
                  >
                    {submitting ? 'En cours...' : 'Ajouter'}
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

export default FamilyDashboard;