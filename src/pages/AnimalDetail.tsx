import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { db } from '../database/db';
import { SyncManager } from '../services/syncManager';
import { v4 as uuidv4 } from 'uuid';
import type { Animal, HealthLog, WeightLog, MovementLog, Camp, JournalLog, VetProduct, BreedStandard } from '../types';
import { calculateAge, getAnimalIcon } from '../utils';
import { BirthWorkflowModal } from '../components/BirthWorkflowModal';

type Tab = 'overview' | 'health' | 'weight' | 'movement' | 'journal';

export const AnimalDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [sire, setSire] = useState<Animal | undefined>(undefined);
  const [dam, setDam] = useState<Animal | undefined>(undefined);
  const [offspring, setOffspring] = useState<Animal[]>([]);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [healthLogs, setHealthLogs] = useState<HealthLog[]>([]);
  const [movementLogs, setMovementLogs] = useState<MovementLog[]>([]);
  const [camps, setCamps] = useState<Camp[]>([]);
  const [journalLogs, setJournalLogs] = useState<JournalLog[]>([]);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [products, setProducts] = useState<VetProduct[]>([]);
  const [breedStandards, setBreedStandards] = useState<BreedStandard[]>([]);
  const [isBirthModalOpen, setIsBirthModalOpen] = useState(false);
  
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [customProduct, setCustomProduct] = useState('');
  const [customWithdrawal, setCustomWithdrawal] = useState('');
  const [saveToPermanent, setSaveToPermanent] = useState(false);
  
  const initialTab = (location.state as any)?.tab as Tab || 'overview';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showWeightForm, setShowWeightForm] = useState(false);
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);

  const [editingWeightId, setEditingWeightId] = useState<string | null>(null);
  const [editingHealthId, setEditingHealthId] = useState<string | null>(null);
  const [editingMovementId, setEditingMovementId] = useState<string | null>(null);
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);

  const [newJournalNote, setNewJournalNote] = useState('');
  const [newJournalDate, setNewJournalDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [newMovementDate, setNewMovementDate] = useState(new Date().toISOString().split('T')[0]);
  const [newOrigin, setNewOrigin] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newPermitNumber, setNewPermitNumber] = useState('');
  const [newVehicleReg, setNewVehicleReg] = useState('');
  const [newMovementNotes, setNewMovementNotes] = useState('');
  
  const [newWeight, setNewWeight] = useState('');
  const [newWeightNotes, setNewWeightNotes] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  const [newTreatmentType, setNewTreatmentType] = useState('Vaccination');
  const [, setNewMedication] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newHealthNotes, setNewHealthNotes] = useState('');
  const [newHealthDate, setNewHealthDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (id) fetchAnimalDetails();
  }, [id]);

  const mapToCamelCase = (dbAnimal: any): Animal => ({
    id: dbAnimal.id,
    species: dbAnimal.species || 'Cattle',
    tagNumber: dbAnimal.tag_number,
    eidNumber: dbAnimal.eid_number,
    isQuarantined: dbAnimal.is_quarantined,
    name: dbAnimal.name,
    breed: dbAnimal.breed,
    sex: dbAnimal.sex,
    dateOfBirth: dbAnimal.date_of_birth,
    status: dbAnimal.status,
    sireId: dbAnimal.sire_id,
    damId: dbAnimal.dam_id,
    weight: dbAnimal.weight,
    currentCampId: dbAnimal.current_camp_id,
    hornStatus: dbAnimal.horn_status,
    meatSafeDate: dbAnimal.meat_safe_date,
    quarantineEndDate: dbAnimal.quarantine_end_date,
  });

  const fetchAnimalDetails = async () => {
    setLoading(true);
    try {
      // 1. Fetch main animal
      const { data: aData, error: aErr } = await supabase.from('animals').select('*').eq('id', id).single();
      if (aErr) throw aErr;
      const mainAnimal = mapToCamelCase(aData);
      setAnimal(mainAnimal);

      // 2. Fetch Sire
      if (mainAnimal.sireId) {
        const { data: sData } = await supabase.from('animals').select('*').eq('id', mainAnimal.sireId).single();
        if (sData) setSire(mapToCamelCase(sData));
      } else {
        setSire(undefined);
      }

      // 3. Fetch Dam
      if (mainAnimal.damId) {
        const { data: dData } = await supabase.from('animals').select('*').eq('id', mainAnimal.damId).single();
        if (dData) setDam(mapToCamelCase(dData));
      } else {
        setDam(undefined);
      }

      // 4. Fetch Offspring
      const { data: oData } = await supabase
        .from('animals')
        .select('*')
        .or(`sire_id.eq.${id},dam_id.eq.${id}`)
        .order('date_of_birth', { ascending: false });
        
      if (oData) {
        setOffspring(oData.map(mapToCamelCase));
      }

      // 5. Fetch Weight Logs
      const { data: wData } = await supabase
        .from('weight_logs')
        .select('*')
        .eq('animal_id', id)
        .order('date_recorded', { ascending: false });
        
      if (wData) {
        setWeightLogs(wData.map(w => ({
          id: w.id,
          animalId: w.animal_id,
          weightKg: w.weight_kg,
          dateRecorded: w.date_recorded,
          notes: w.notes,
          createdAt: w.created_at
        })));
      }

      // 6. Fetch Health Logs
      const { data: hData } = await supabase
        .from('health_logs')
        .select('*')
        .eq('animal_id', id)
        .order('date_administered', { ascending: false });
        
      if (hData) {
        setHealthLogs(hData.map(h => ({
          id: h.id,
          animalId: h.animal_id,
          treatmentType: h.treatment_type,
          medication: h.medication,
          dosage: h.dosage,
          dateAdministered: h.date_administered,
          notes: h.notes,
          createdAt: h.created_at,
          safeDate: h.safe_date
        })));
      }

      // 7. Fetch Movement Logs
      const { data: mData } = await supabase
        .from('movement_log')
        .select('*')
        .eq('animal_id', id)
        .order('movement_date', { ascending: false });
        
      if (mData) {
        setMovementLogs(mData.map(m => ({
          id: m.id,
          animalId: m.animal_id,
          movementDate: m.movement_date,
          origin: m.origin,
          destination: m.destination,
          permitNumber: m.permit_number,
          vehicleRegistration: m.vehicle_registration,
          notes: m.notes,
          createdAt: m.created_at
        })));
      }
      // 8. Fetch Journal Logs
      const { data: jData, error: jErr } = await supabase
        .from('journal_logs')
        .select('*')
        .eq('animal_id', id)
        .order('date_recorded', { ascending: false });
        
      if (jData) {
        setJournalLogs(jData.map(j => ({
          id: j.id,
          animalId: j.animal_id,
          noteText: j.note_text,
          dateRecorded: j.date_recorded,
          audioUrl: j.audio_url,
          audioSizeBytes: j.audio_size_bytes,
          audioDurationSeconds: j.audio_duration_seconds,
          createdAt: j.created_at
        })));
      } else if (jErr && jErr.code !== '42P01') {
        console.warn('Error fetching journal logs:', jErr);
      }

      // 9. Fetch Camps to resolve camp names
      const { data: cData } = await supabase.from('camps').select('*');
      if (cData) {
        setCamps(cData.map(c => ({ id: c.id, name: c.name }) as Camp));
      }

      // 10. Fetch Vet Products & Standards
      const gvpTable = mainAnimal.species === 'Sheep' ? 'global_sheep_vet_products' : 'global_vet_products';
      const uvpTable = mainAnimal.species === 'Sheep' ? 'user_sheep_vet_products' : 'user_vet_products';
      const gbsTable = mainAnimal.species === 'Sheep' ? 'global_sheep_breed_standards' : 'global_breed_standards';

      const { data: gvp } = await supabase.from(gvpTable).select('*');
      const userRes = await supabase.auth.getUser();
      let uvp: any[] = [];
      if (userRes.data.user) {
        const { data: uData } = await supabase.from(uvpTable).select('*').eq('user_id', userRes.data.user.id);
        if (uData) uvp = uData;
      }
      if (gvp) {
        const mappedGvp = gvp.map((p: any) => ({
          id: p.id, category: p.category, productName: p.product_name, dosageMlPerKg: p.dosage_ml_per_kg, meatWithdrawalDays: p.meat_withdrawal_days, milkWithdrawalDays: p.milk_withdrawal_days
        }));
        const mappedUvp = uvp.map((p: any) => ({
          id: p.id, category: p.category, productName: p.product_name, dosageMlPerKg: p.dosage_ml_per_kg, meatWithdrawalDays: p.meat_withdrawal_days, milkWithdrawalDays: p.milk_withdrawal_days, isCustom: true
        }));
        setProducts([...mappedGvp, ...mappedUvp]);
      }

      const { data: gbs } = await supabase.from(gbsTable).select('*');
      if (gbs) {
        setBreedStandards(gbs.map((b: any) => ({
          id: b.id, breedName: b.breed_name, birthWeightKg: b.birth_weight_kg, weaningWeightKg: b.weaning_weight_kg, matureCowKg: b.mature_cow_kg || b.mature_ewe_kg, matureBullKg: b.mature_bull_kg || b.mature_ram_kg
        })));
      }

    } catch (error) {
      console.error('Error fetching animal details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: 'Sold' | 'Deceased') => {
    let soldPrice: number | null = null;
    let saleGps: string | null = null;
    let gpsSource: 'Auto' | 'Manual' | null = null;

    if (newStatus === 'Sold') {
      if (animal?.isQuarantined) {
        alert("Cannot sell an animal while it is under FMD Quarantine.");
        return;
      }
      
      const priceStr = window.prompt(`Are you sure you want to mark this animal as Sold?\nEnter the Sold Price (or leave blank if none):`);
      if (priceStr === null) return; // cancelled
      if (priceStr.trim() !== '') {
        soldPrice = parseFloat(priceStr);
        if (isNaN(soldPrice)) {
          alert("Invalid price entered. Action cancelled.");
          return;
        }
      }

      // Automatically capture GPS for Sale
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { 
             enableHighAccuracy: true,
             timeout: 5000 
          });
        });
        saleGps = `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`;
        gpsSource = 'Auto';
      } catch (err) {
        console.warn("GPS capture failed", err);
        const manualGps = window.prompt("Could not auto-capture GPS. FMD compliance requires a location for Sale.\nPlease enter Sale Location GPS manually (e.g. -29.112, 26.211):");
        if (!manualGps) {
          alert("Sale cancelled. GPS location is required.");
          return;
        }
        saleGps = manualGps;
        gpsSource = 'Manual';
      }
    } else {
      if (!window.confirm(`Are you sure you want to mark this animal as ${newStatus}?`)) return;
    }
    
    try {
      const updateData: any = { status: newStatus };
      if (soldPrice !== null) updateData.sold_price = soldPrice;
      
      // Update local Dexie DB and Sync Queue
      await db.animals.update(id!, { 
         status: newStatus, 
         ...(soldPrice !== null && { soldPrice }) 
      });
      await SyncManager.queueUpdate('animals', id!, updateData);

      // If Sold, log the movement out
      if (newStatus === 'Sold') {
        const movementId = uuidv4();
        const departureLog = {
          id: movementId,
          animalId: id!,
          movementDate: new Date().toISOString().split('T')[0],
          origin: animal?.currentCampId ? `Camp ID: ${animal.currentCampId}` : 'Current Farm',
          destination: 'Sold / Off-farm',
          originGps: saleGps!,
          gpsSource: gpsSource as 'Auto' | 'Manual',
          notes: 'Marked as Sold.'
        };
        await db.movement_log.add(departureLog);
        
        await SyncManager.queueInsert('movement_log', movementId, {
          id: movementId,
          animal_id: id!,
          movement_date: departureLog.movementDate,
          origin: departureLog.origin,
          destination: departureLog.destination,
          origin_gps: departureLog.originGps,
          gps_source: departureLog.gpsSource,
          notes: departureLog.notes
        });
      }
      
      setAnimal(prev => prev ? { ...prev, status: newStatus, soldPrice: soldPrice !== null ? soldPrice : prev.soldPrice } : null);
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleDelete = async () => {
    if (offspring.length > 0) {
      alert(`Cannot delete ${animal?.tagNumber} because it is listed as a parent to ${offspring.length} calf/calves. Please edit the calves to remove this parent first, or simply mark this animal as Sold or Deceased.`);
      return;
    }
    
    if (!window.confirm(`WARNING: Are you absolutely sure you want to PERMANENTLY delete ${animal?.tagNumber}? This cannot be undone.`)) return;

    try {
      const { error } = await supabase.from('animals').delete().eq('id', id);
      if (error) throw error;
      
      alert('Animal deleted successfully.');
      navigate('/herd');
    } catch (error: any) {
      console.error('Failed to delete:', error);
      alert('Error deleting animal: ' + error.message);
    }
  };

  const handleAddWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeight) return;
    
    try {
      const payload = {
        animal_id: id,
        weight_kg: parseFloat(newWeight),
        date_recorded: newWeightDate,
        notes: newWeightNotes
      };
      
      let data, error;
      if (editingWeightId) {
        const res = await supabase.from('weight_logs').update(payload).eq('id', editingWeightId).select();
        data = res.data; error = res.error;
      } else {
        const res = await supabase.from('weight_logs').insert([payload]).select();
        data = res.data; error = res.error;
      }
      
      if (error) throw error;
      
      if (data) {
        const newLog: WeightLog = {
          id: data[0].id,
          animalId: data[0].animal_id,
          weightKg: data[0].weight_kg,
          dateRecorded: data[0].date_recorded,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        if (editingWeightId) {
            setWeightLogs(weightLogs.map(l => l.id === editingWeightId ? newLog : l));
        } else {
            setWeightLogs([newLog, ...weightLogs]);
        }
        
        if (!animal?.weight || new Date(newWeightDate) >= new Date()) {
          const { error: updateErr } = await supabase.from('animals').update({ weight: parseFloat(newWeight) }).eq('id', id);
          if (!updateErr) {
            setAnimal(prev => prev ? { ...prev, weight: parseFloat(newWeight) } : null);
          }
        }
      }
      
      setNewWeight('');
      setNewWeightNotes('');
      setShowWeightForm(false);
      setEditingWeightId(null);
    } catch (error: any) {
      alert('Error saving weight: ' + error.message);
    }
  };

  const handleEditWeight = (log: WeightLog) => {
    setEditingWeightId(log.id);
    setNewWeight(log.weightKg.toString());
    setNewWeightDate(log.dateRecorded);
    setNewWeightNotes(log.notes || '');
    setShowWeightForm(true);
    setActiveTab('weight');
  };

  const handleDeleteWeight = async (logId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this weight record?")) return;
    try {
      const { error } = await supabase.from('weight_logs').delete().eq('id', logId);
      if (error) throw error;
      setWeightLogs(weightLogs.filter(l => l.id !== logId));
    } catch (error: any) {
      alert('Error deleting weight: ' + error.message);
    }
  };

  const calculateEstimatedWeight = () => {
    if (weightLogs.length > 0) {
      const latestWeight = weightLogs[0];
      const daysSinceRecord = (new Date().getTime() - new Date(latestWeight.dateRecorded).getTime()) / (1000 * 3600 * 24);
      if (daysSinceRecord <= 30) {
        return latestWeight.weightKg;
      }
    }
    
    const std = breedStandards.find(b => b.breedName === animal?.breed);
    if (!std) return animal?.species === 'Sheep' ? 40 : 300; 
    
    const isSheep = animal?.species === 'Sheep';
    const weaningMonths = isSheep ? 4 : 7;
    const maturityMonths = isSheep ? 12 : 36;
    
    const ageResult = calculateAge(animal!.dateOfBirth);
    const totalMonths = ageResult ? ageResult.totalMonths || 0 : 0;
    if (totalMonths <= weaningMonths) {
      return std.birthWeightKg + (totalMonths * ((std.weaningWeightKg - std.birthWeightKg) / weaningMonths));
    } else {
      const matureWeight = animal?.sex === 'Male' ? std.matureBullKg : std.matureCowKg;
      if (totalMonths >= maturityMonths) return matureWeight;
      const monthsPostWeaning = totalMonths - weaningMonths;
      return std.weaningWeightKg + (monthsPostWeaning * ((matureWeight - std.weaningWeightKg) / (maturityMonths - weaningMonths)));
    }
  };

  const handleAddHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTreatmentType) return;
    
    const productDef = products.find(p => p.productName === selectedProduct);
    const weightToUse = calculateEstimatedWeight();
    const requiredDose = productDef ? weightToUse * productDef.dosageMlPerKg : null;

    if (requiredDose && !isOtherSelected && newDosage) {
       const enteredDosage = parseFloat(newDosage);
       if (!isNaN(enteredDosage)) {
         const variance = Math.abs((enteredDosage - requiredDose) / requiredDose);
         if (variance > 0.15) {
             if(!window.confirm(`ℹ️ Estimated weight used: ${weightToUse.toFixed(1)}kg. Standard dose is approx. ${requiredDose.toFixed(1)}ml. Please confirm your entry.`)) {
                 return; // Halt Save
             }
         }
       }
    }

    const finalMedication = isOtherSelected ? customProduct : selectedProduct;
    const withdrawalDays = isOtherSelected && customWithdrawal ? parseInt(customWithdrawal) : productDef?.meatWithdrawalDays;
      
    let safeDateStr: string | undefined = undefined;
    if (withdrawalDays && withdrawalDays !== 999) { 
        const d = new Date(newHealthDate);
        d.setDate(d.getDate() + withdrawalDays);
        safeDateStr = d.toISOString().split('T')[0];
    }
    
    try {
      if (isOtherSelected && saveToPermanent && customProduct && customWithdrawal) {
          const userRes = await supabase.auth.getUser();
          if (userRes.data.user) {
              const newProd = {
                  user_id: userRes.data.user.id,
                  category: newTreatmentType,
                  product_name: customProduct,
                  dosage_ml_per_kg: 0, 
                  meat_withdrawal_days: parseInt(customWithdrawal) || 0,
                  milk_withdrawal_days: 0
              };
              const targetTable = animal?.species === 'Sheep' ? 'user_sheep_vet_products' : 'user_vet_products';
              await supabase.from(targetTable).insert([newProd]);
          }
      }

      const payload: any = {
        animal_id: id,
        treatment_type: newTreatmentType,
        medication: finalMedication,
        dosage: newDosage,
        date_administered: newHealthDate,
        notes: newHealthNotes
      };
      if (safeDateStr) payload.safe_date = safeDateStr;
      
      let data, error;
      if (editingHealthId) {
        const res = await supabase.from('health_logs').update(payload).eq('id', editingHealthId).select();
        data = res.data; error = res.error;
      } else {
        const res = await supabase.from('health_logs').insert([payload]).select();
        data = res.data; error = res.error;
      }
      if (error) throw error;
      
      if (data) {
        const newLog: HealthLog = {
          id: data[0].id,
          animalId: data[0].animal_id,
          treatmentType: data[0].treatment_type,
          medication: data[0].medication,
          dosage: data[0].dosage,
          dateAdministered: data[0].date_administered,
          notes: data[0].notes,
          createdAt: data[0].created_at,
          safeDate: data[0].safe_date
        };
        if (editingHealthId) {
          setHealthLogs(healthLogs.map(l => l.id === editingHealthId ? newLog : l));
        } else {
          setHealthLogs([newLog, ...healthLogs]);
        }
        
        if (safeDateStr) {
           const curSafe = animal?.meatSafeDate ? new Date(animal.meatSafeDate) : new Date(0);
           const newSafe = new Date(safeDateStr);
           if (newSafe > curSafe) {
              await supabase.from('animals').update({ meat_safe_date: safeDateStr }).eq('id', id);
              setAnimal(prev => prev ? { ...prev, meatSafeDate: safeDateStr } : null);
           }
        }
      }
      
      setNewTreatmentType('Vaccination');
      setSelectedProduct('');
      setCustomProduct('');
      setCustomWithdrawal('');
      setIsOtherSelected(false);
      setNewDosage('');
      setNewHealthNotes('');
      setShowHealthForm(false);
      setEditingHealthId(null);
      setSaveToPermanent(false);
    } catch (error: any) {
      alert('Error saving health record: ' + error.message);
    }
  };

  const handleEditHealth = (log: HealthLog) => {
    setEditingHealthId(log.id);
    setNewTreatmentType(log.treatmentType);
    setNewMedication(log.medication || '');
    setNewDosage(log.dosage || '');
    setNewHealthDate(log.dateAdministered);
    setNewHealthNotes(log.notes || '');
    setShowHealthForm(true);
    setActiveTab('health');
  };

  const handleDeleteHealth = async (logId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this health record?")) return;
    try {
      const { error } = await supabase.from('health_logs').delete().eq('id', logId);
      if (error) throw error;
      setHealthLogs(healthLogs.filter(l => l.id !== logId));
    } catch (error: any) {
      alert('Error deleting health record: ' + error.message);
    }
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrigin || !newDestination) return;
    
    try {
      const payload = {
        animal_id: id,
        movement_date: newMovementDate,
        origin: newOrigin,
        destination: newDestination,
        permit_number: newPermitNumber,
        vehicle_registration: newVehicleReg,
        notes: newMovementNotes
      };
      
      let data, error;
      if (editingMovementId) {
        const res = await supabase.from('movement_log').update(payload).eq('id', editingMovementId).select();
        data = res.data; error = res.error;
      } else {
        const res = await supabase.from('movement_log').insert([payload]).select();
        data = res.data; error = res.error;
      }
      if (error) throw error;
      
      if (data) {
        const newLog: MovementLog = {
          id: data[0].id,
          animalId: data[0].animal_id,
          movementDate: data[0].movement_date,
          origin: data[0].origin,
          destination: data[0].destination,
          permitNumber: data[0].permit_number,
          vehicleRegistration: data[0].vehicle_registration,
          notes: data[0].notes,
          createdAt: data[0].created_at
        };
        if (editingMovementId) {
          setMovementLogs(movementLogs.map(l => l.id === editingMovementId ? newLog : l));
        } else {
          setMovementLogs([newLog, ...movementLogs]);
        }
      }
      
      setNewOrigin('');
      setNewDestination('');
      setNewPermitNumber('');
      setNewVehicleReg('');
      setNewMovementNotes('');
      setShowMovementForm(false);
      setEditingMovementId(null);
    } catch (error: any) {
      alert('Error saving movement record: ' + error.message);
    }
  };

  const handleEditMovement = (log: MovementLog) => {
    setEditingMovementId(log.id);
    setNewMovementDate(log.movementDate);
    setNewOrigin(log.origin);
    setNewDestination(log.destination);
    setNewPermitNumber(log.permitNumber || '');
    setNewVehicleReg(log.vehicleRegistration || '');
    setNewMovementNotes(log.notes || '');
    setShowMovementForm(true);
    setActiveTab('movement');
  };

  const handleDeleteMovement = async (logId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this movement record?")) return;
    try {
      const { error } = await supabase.from('movement_log').delete().eq('id', logId);
      if (error) throw error;
      setMovementLogs(movementLogs.filter(l => l.id !== logId));
    } catch (error: any) {
      alert('Error deleting movement record: ' + error.message);
    }
  };

  const handleAddJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJournalNote && !audioBlob) return;
    
    if (audioBlob) {
      const userRes = await supabase.auth.getUser();
      if (userRes.data.user) {
        const settings = await db.farm_settings.get(userRes.data.user.id);
        if (settings && (settings.audioUsedBytes || 0) + audioBlob.size > 104857600) {
          alert('Audio storage limit of 100MB reached. Please delete old voice notes or upgrade.');
          return;
        }
      }
    }

    try {
      const journalId = editingJournalId || uuidv4();
      let audioFileName = undefined;
      
      if (audioBlob) {
        const ext = audioBlob.type.includes('mp4') ? 'm4a' : 'webm';
        audioFileName = `${id}/${journalId}.${ext}`;
        
        await db.offline_audio_queue.add({
          id: journalId,
          blob: audioBlob,
          fileName: audioFileName,
          mimeType: audioBlob.type,
          createdAt: new Date().toISOString(),
          status: 'pending'
        });
        
        const userRes = await supabase.auth.getUser();
        if (userRes.data.user) {
           const settings = await db.farm_settings.get(userRes.data.user.id);
           if (settings) {
             const newQuota = (settings.audioUsedBytes || 0) + audioBlob.size;
             await db.farm_settings.update(userRes.data.user.id, { audioUsedBytes: newQuota });
             await SyncManager.queueUpdate('farm_settings', userRes.data.user.id, { audio_used_bytes: newQuota });
           }
        }
      }

      const journalPayload: any = {
        id: journalId,
        animal_id: id,
        note_text: newJournalNote || 'Audio Note',
        date_recorded: newJournalDate,
      };

      if (audioBlob) {
        journalPayload.audio_url = audioFileName;
        journalPayload.audio_size_bytes = audioBlob.size;
        journalPayload.audio_duration_seconds = recordingTime;
      }

      if (editingJournalId) {
        const existing = journalLogs.find(l => l.id === editingJournalId);
        if (!audioBlob && existing) {
           journalPayload.audio_url = existing.audioUrl;
           journalPayload.audio_size_bytes = existing.audioSizeBytes;
           journalPayload.audio_duration_seconds = existing.audioDurationSeconds;
        }
        
        await db.journal_logs.update(editingJournalId, {
           noteText: journalPayload.note_text,
           dateRecorded: journalPayload.date_recorded,
           ...(audioBlob && {
             audioUrl: journalPayload.audio_url,
             audioSizeBytes: journalPayload.audio_size_bytes,
             audioDurationSeconds: journalPayload.audio_duration_seconds
           })
        });
        await SyncManager.queueUpdate('journal_logs', editingJournalId, journalPayload);
        
        const newLog: JournalLog = {
          id: journalId,
          animalId: id!,
          noteText: journalPayload.note_text,
          dateRecorded: journalPayload.date_recorded,
          audioUrl: journalPayload.audio_url,
          audioSizeBytes: journalPayload.audio_size_bytes,
          audioDurationSeconds: journalPayload.audio_duration_seconds,
          createdAt: existing ? existing.createdAt : new Date().toISOString()
        };
        setJournalLogs(journalLogs.map(l => l.id === editingJournalId ? newLog : l));
        
      } else {
        await db.journal_logs.add({
          id: journalId,
          animalId: id!,
          noteText: journalPayload.note_text,
          dateRecorded: journalPayload.date_recorded,
          audioUrl: journalPayload.audio_url,
          audioSizeBytes: journalPayload.audio_size_bytes,
          audioDurationSeconds: journalPayload.audio_duration_seconds,
          createdAt: new Date().toISOString(),
        });
        await SyncManager.queueInsert('journal_logs', journalId, journalPayload);
        
        const newLog: JournalLog = {
          id: journalId,
          animalId: id!,
          noteText: journalPayload.note_text,
          dateRecorded: journalPayload.date_recorded,
          audioUrl: journalPayload.audio_url,
          audioSizeBytes: journalPayload.audio_size_bytes,
          audioDurationSeconds: journalPayload.audio_duration_seconds,
          createdAt: new Date().toISOString()
        };
        setJournalLogs([newLog, ...journalLogs]);
      }
      
      setNewJournalNote('');
      setAudioBlob(null);
      setRecordingTime(0);
      setShowJournalForm(false);
      setEditingJournalId(null);
    } catch (error: any) {
      alert('Error saving journal note: ' + error.message);
    }
  };

  const handleEditJournal = (log: JournalLog) => {
    setEditingJournalId(log.id);
    setNewJournalDate(log.dateRecorded);
    setNewJournalNote(log.noteText);
    setAudioBlob(null); // Keep original audio unless overridden
    setShowJournalForm(true);
    setActiveTab('journal');
  };

  const handleDeleteJournal = async (logId: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this journal entry?")) return;
    try {
      await db.journal_logs.delete(logId);
      await SyncManager.queueDelete('journal_logs', logId);
      setJournalLogs(journalLogs.filter(l => l.id !== logId));
    } catch (error: any) {
      alert('Error deleting journal entry: ' + error.message);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
        
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      recorder.onstop = () => {
        const actualMimeType = recorder.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type: actualMimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= 59) {
            recorder.stop();
            setIsRecording(false);
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
      
    } catch (err) {
      console.error("Audio recording failed", err);
      alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const discardAudio = () => {
    setAudioBlob(null);
    setRecordingTime(0);
  };

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Loading profile from database...</div>;
  }

  if (!animal) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Animal not found</h2>
        <button className="btn btn-outline" onClick={() => navigate('/herd')} style={{ marginTop: '16px' }}>Back to Herd</button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Active': return <span className="badge badge-green">Active</span>;
      case 'Sold': return <span className="badge badge-blue">Sold</span>;
      case 'Deceased': return <span className="badge badge-red">Deceased</span>;
      default: return <span className="badge badge-gray">{status}</span>;
    }
  };

  const AnimalCard = ({ ani, title }: { ani?: Animal, title: string }) => {
    if (!ani) {
      return (
        <div className="card" style={{ padding: '16px', border: '1px dashed var(--border)', background: 'transparent' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{title}</div>
          <div style={{ color: 'var(--text-muted)' }}>Unknown / Not Recorded</div>
        </div>
      );
    }
    
    return (
      <div 
        className="card" 
        style={{ padding: '16px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
        onClick={() => navigate(`/herd/${ani.id}`)}
      >
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 600 }}>{title}</div>
        <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{ani.tagNumber}</div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {ani.breed} • {ani.sex} • {ani.name || 'No Name'}
        </div>
      </div>
    );
  };

  return (
    <>
    <div style={{ paddingBottom: '80px' }}>
      <div className="page-header" style={{ paddingBottom: '0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: (animal.isQuarantined || (animal.meatSafeDate && new Date(animal.meatSafeDate) > new Date())) ? '20px' : '32px', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn btn-outline" onClick={() => navigate('/herd')} style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Back to Herd">
              &larr;
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <h1 className="page-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem' }}>
                <span>{getAnimalIcon(animal.species, animal.breed, animal.sex)}</span>
                {animal.tagNumber}
              </h1>
              {getStatusBadge(animal.status)}
            </div>
          </div>
          
          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
            <button className="btn btn-primary" onClick={() => navigate(`/herd/${animal.id}/edit`)} style={{ padding: '8px 16px' }}>
              <span style={{ marginRight: '6px' }}>✏️</span> Edit
            </button>
            
            <button className="btn btn-outline" onClick={() => setShowActionsMenu(!showActionsMenu)} style={{ padding: '8px 12px', fontWeight: 900 }}>
              &hellip;
            </button>

            {showActionsMenu && (
              <div className="action-menu-dropdown fade-in">
                {animal.status === 'Active' && (
                  <>
                    <button 
                      className="action-menu-item"
                      onClick={() => { setShowActionsMenu(false); handleStatusChange('Sold'); }}
                      disabled={animal.isQuarantined}
                      style={animal.isQuarantined ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    >
                      🏷️ Mark Sold
                    </button>
                    <button 
                      className="action-menu-item"
                      onClick={() => { setShowActionsMenu(false); handleStatusChange('Deceased'); }}
                    >
                      ✝️ Mark Deceased
                    </button>
                  </>
                )}
                <button 
                  className="action-menu-item" 
                  style={{ color: '#ef4444' }}
                  onClick={() => { setShowActionsMenu(false); handleDelete(); }}
                >
                  🗑️ Permanently Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ALERTS SECTION */}
        {(animal.isQuarantined || (animal.meatSafeDate && new Date(animal.meatSafeDate) > new Date())) && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', width: '100%' }}>
            {animal.isQuarantined && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #F87171', color: '#991B1B', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '0.95rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '1.2rem' }}>🛑</span> 
                <span><strong>Quarantined:</strong> This animal is under strict movement isolation.</span>
              </div>
            )}
            {animal.meatSafeDate && new Date(animal.meatSafeDate) > new Date() && (
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FCD34D', color: '#B45309', padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 500, fontSize: '0.95rem', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span> 
                <span><strong>Withdrawal Active:</strong> Meat is not safe for consumption until <strong>{new Date(animal.meatSafeDate).toLocaleDateString()}</strong>.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TABS NAVIGATION */}
      <div className="tabs-container sticky-tabs">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`profile-tab ${activeTab === 'overview' ? 'active' : ''}`}
          data-text="Overview"
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('health')}
          className={`profile-tab ${activeTab === 'health' ? 'active' : ''}`}
          data-text="Health"
        >
          Health
        </button>
        <button 
          onClick={() => setActiveTab('weight')}
          className={`profile-tab ${activeTab === 'weight' ? 'active' : ''}`}
          data-text="Weight"
        >
          Weight
        </button>
        <button 
          onClick={() => setActiveTab('movement')}
          className={`profile-tab ${activeTab === 'movement' ? 'active' : ''}`}
          data-text="Movements"
        >
          Movements
        </button>
        <button 
          onClick={() => setActiveTab('journal')}
          className={`profile-tab ${activeTab === 'journal' ? 'active' : ''}`}
          data-text="Notes"
        >
          Notes
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="responsive-grid-sidebar">
          
          {/* Left Column - Details & Offspring */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="card" style={{ padding: '32px' }}>
            <h3 style={{ marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>Animal Profile</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="info-row">
                <span className="info-label">EID Tag</span>
                <span className="info-value" style={{ fontFamily: 'monospace' }}>{animal.eidNumber || 'Not registered'}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Species</span>
                <span className="info-value">{getAnimalIcon(animal.species, animal.breed, animal.sex)} {animal.species}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Breed</span>
                <span className="info-value">{animal.breed}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Sex</span>
                <span className="info-value">{animal.sex} {animal.hornStatus ? `(${animal.hornStatus})` : ''}</span>
              </div>
              <div className="info-row">
                <span className="info-label">Date of Birth</span>
                <span className="info-value">
                  {new Date(animal.dateOfBirth).toLocaleDateString()} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 400 }}>({calculateAge(animal.dateOfBirth).display} old)</span>
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Current Camp</span>
                <span className="info-value">
                  {animal.currentCampId ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--surface)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                      📍 {camps.find(c => c.id === animal.currentCampId)?.name || 'Unknown'}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>Unassigned</span>
                  )}
                </span>
              </div>
              <div className="info-row">
                <span className="info-label">Current Weight</span>
                <span className="info-value">{animal.weight ? `${animal.weight} kg` : 'Not recorded'}</span>
              </div>
              {animal.currentCampId && movementLogs.length > 0 && (
                <div className="info-row">
                  <span className="info-label">Days in Current Pasture</span>
                  <span className="info-value" style={{ color: 'var(--primary-dark)' }}>
                    {(() => {
                      const currentCampName = camps.find(c => c.id === animal.currentCampId)?.name;
                      const lastMoveToCurrent = movementLogs.find(m => m.destination === currentCampName);
                      if (!lastMoveToCurrent) return 'Unknown';
                      
                      const moveDate = new Date(lastMoveToCurrent.movementDate);
                      const today = new Date();
                      const diffTime = Math.abs(today.getTime() - moveDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
                      
                      return `${diffDays} Day${diffDays === 1 ? '' : 's'} (since ${moveDate.toLocaleDateString()})`;
                    })()}
                  </span>
                </div>
              )}
              {animal.brand && (
                <div className="info-row">
                  <span className="info-label">Ownership Brand</span>
                  <span className="info-value">{animal.brand}</span>
                </div>
              )}
              {animal.status === 'Sold' && animal.soldPrice && (
                <div className="info-row">
                  <span className="info-label">Sold Price</span>
                  <span className="info-value" style={{ color: '#059669' }}>R {animal.soldPrice.toFixed(2)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '10px' }}>
              <h3 style={{ margin: 0 }}>Registered Offspring ({offspring.length})</h3>
              <button 
                className="btn btn-outline" 
                onClick={() => setIsBirthModalOpen(true)}
                style={{ padding: '6px 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>+</span> {animal.species === 'Sheep' ? 'Add Lamb' : 'Add Calf'}
              </button>
            </div>
            
            {offspring.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No offspring registered in the system yet.</p>
            ) : (
              <div className="responsive-grid-2col" style={{ gap: '16px' }}>
                {offspring.map(calf => (
                  <AnimalCard key={calf.id} ani={calf} title={animal.species === 'Sheep' ? 'Lamb' : 'Calf'} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Lineage Tree */}
        <div className="card" style={{ padding: '24px', backgroundColor: 'var(--bg-off)' }}>
          <h3 style={{ marginBottom: '24px', textAlign: 'center' }}>Lineage Tree</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Parents Layer */}
            <AnimalCard ani={sire} title="Sire (Father)" />
            <AnimalCard ani={dam} title="Dam (Mother)" />
            
            {/* Connector Visual */}
            <div style={{ display: 'flex', justifyContent: 'center', margin: '4px 0' }}>
              <div style={{ height: '24px', width: '2px', backgroundColor: 'var(--border)' }}></div>
            </div>
            
            {/* Current Animal */}
            <div className="card" style={{ padding: '16px', border: '1px solid var(--primary)', position: 'relative', marginTop: '8px', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.1)' }}>
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
                <span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 600 }}>THIS ANIMAL</span>
              </div>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '8px' }}>{animal.tagNumber}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {animal.breed} • {animal.weight ? `${animal.weight} kg` : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* TAB CONTENT: HEALTH */}
      {activeTab === 'health' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <h2>Health Records</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowHealthForm(!showHealthForm)}
              disabled={animal?.status === 'Sold' || animal?.status === 'Deceased'}
              title={animal?.status === 'Sold' || animal?.status === 'Deceased' ? 'Cannot add records to inactive animals' : ''}
            >
              {showHealthForm ? 'Cancel' : 'Log Treatment'}
            </button>
          </div>
          
          {showHealthForm && (
            <form onSubmit={handleAddHealth} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Treatment Record</h3>
              <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={newHealthDate} onChange={e => setNewHealthDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Treatment Type</label>
                  <select className="form-input" value={newTreatmentType} onChange={e => { setNewTreatmentType(e.target.value); setIsOtherSelected(false); setSelectedProduct(''); }}>
                    <option value="Vaccination">Vaccination</option>
                    <option value="Deworming">Deworming</option>
                    <option value="Illness / Injury">Illness / Injury</option>
                    <option value="General Checkup">General Checkup</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Medication / Product</label>
                  <select 
                    className="form-input" 
                    value={isOtherSelected ? 'Other' : selectedProduct} 
                    onChange={e => {
                        const val = e.target.value;
                        if (val === 'Other') {
                            setIsOtherSelected(true);
                            setSelectedProduct('');
                        } else {
                            setIsOtherSelected(false);
                            setSelectedProduct(val);
                            
                            const pDef = products.find(p => p.productName === val);
                            if (pDef) {
                                const weightToUse = calculateEstimatedWeight();
                                const estimatedDose = weightToUse * pDef.dosageMlPerKg;
                                setNewDosage(estimatedDose.toFixed(1));
                            }
                        }
                    }}
                  >
                    <option value="">-- Select Product --</option>
                    {products.filter(p => p.category === newTreatmentType).map(p => (
                        <option key={p.id} value={p.productName}>{p.productName} {p.isCustom ? '(Custom)' : ''}</option>
                    ))}
                    <option value="Other">Other (Manual Entry)</option>
                  </select>
                </div>
                
                {isOtherSelected && (
                    <>
                        <div className="form-group">
                          <label className="form-label">Custom Product Name</label>
                          <input type="text" className="form-input" required value={customProduct} onChange={e => setCustomProduct(e.target.value)} />
                        </div>
                        <div className="form-group">
                          <label className="form-label">Withdrawal Period (Days)</label>
                          <input type="number" className="form-input" required value={customWithdrawal} onChange={e => setCustomWithdrawal(e.target.value)} placeholder="0 for none" />
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input type="checkbox" checked={saveToPermanent} onChange={e => setSaveToPermanent(e.target.checked)} />
                            <span>Save this product to my permanent custom list</span>
                          </label>
                        </div>
                    </>
                )}

                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <label className="form-label" style={{ marginBottom: 0 }}>Dosage (ml)</label>
                    <span 
                      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', color: 'white', fontSize: '11px', fontWeight: 'bold' }} 
                      onClick={() => alert("Dosage is automatically calculated based on the selected medicine's dosage guidelines and the animal's estimated weight, which is derived from either a recent recorded weight (last 30 days) or an algorithmic projection based on age and breed standards.")}
                      title="How is this calculated?"
                    >
                      i
                    </span>
                  </div>
                  <input type="number" step="0.01" className="form-input" placeholder="e.g. 10.5" value={newDosage} onChange={e => setNewDosage(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={newHealthNotes} onChange={e => setNewHealthNotes(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Record</button>
            </form>
          )}

          {healthLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No health records found for this animal.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Treatment Type</th>
                    <th>Medication</th>
                    <th>Dosage</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {healthLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.dateAdministered).toLocaleDateString()}</td>
                      <td>{log.treatmentType}</td>
                      <td>{log.medication || '-'}</td>
                      <td>{log.dosage || '-'}</td>
                      <td>{log.notes || '-'}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleEditHealth(log)}>✏️</button>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDeleteHealth(log.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WEIGHT */}
      {activeTab === 'weight' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <h2>Weight History</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowWeightForm(!showWeightForm)}
              disabled={animal?.status === 'Sold' || animal?.status === 'Deceased'}
              title={animal?.status === 'Sold' || animal?.status === 'Deceased' ? 'Cannot add records to inactive animals' : ''}
            >
              {showWeightForm ? 'Cancel' : 'Log Weight'}
            </button>
          </div>
          
          {showWeightForm && (
            <form onSubmit={handleAddWeight} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Weight Record</h3>
              <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input type="date" className="form-input" required value={newWeightDate} onChange={e => setNewWeightDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Weight (kg)</label>
                  <input type="number" step="0.1" className="form-input" required value={newWeight} onChange={e => setNewWeight(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={newWeightNotes} onChange={e => setNewWeightNotes(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Weight</button>
            </form>
          )}

          {weightLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No weight records found for this animal.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date Recorded</th>
                    <th>Weight (kg)</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {weightLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.dateRecorded).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>{log.weightKg} kg</td>
                      <td>{log.notes || '-'}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleEditWeight(log)}>✏️</button>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDeleteWeight(log.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: MOVEMENT */}
      {activeTab === 'movement' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <h2>Movement History</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowMovementForm(!showMovementForm)}
              disabled={animal?.status === 'Sold' || animal?.status === 'Deceased'}
              title={animal?.status === 'Sold' || animal?.status === 'Deceased' ? 'Cannot add records to inactive animals' : ''}
            >
              {showMovementForm ? 'Cancel' : 'Log Movement'}
            </button>
          </div>
          
          {showMovementForm && (
            <form onSubmit={handleAddMovement} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Movement Record</h3>
              <div className="responsive-grid-2col" style={{ gap: '16px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Date of Movement</label>
                  <input type="date" className="form-input" required value={newMovementDate} onChange={e => setNewMovementDate(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">State Vet Permit Number</label>
                  <input type="text" className="form-input" placeholder="e.g. RC-12345" value={newPermitNumber} onChange={e => setNewPermitNumber(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Origin</label>
                  <input type="text" className="form-input" required placeholder="Farm Name / Camp" value={newOrigin} onChange={e => setNewOrigin(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Destination</label>
                  <input type="text" className="form-input" required placeholder="Buyer / Abattoir / Farm" value={newDestination} onChange={e => setNewDestination(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Vehicle Registration</label>
                  <input type="text" className="form-input" placeholder="Truck Plate Number" value={newVehicleReg} onChange={e => setNewVehicleReg(e.target.value)} />
                </div>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Notes</label>
                <textarea className="form-input" rows={2} value={newMovementNotes} onChange={e => setNewMovementNotes(e.target.value)}></textarea>
              </div>
              <button type="submit" className="btn btn-primary">Save Movement</button>
            </form>
          )}

          {movementLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No movement records found for this animal.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Origin</th>
                    <th>Destination</th>
                    <th>Permit No.</th>
                    <th>Vehicle Reg</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {movementLogs.map((log) => (
                    <tr key={log.id}>
                      <td>{new Date(log.movementDate).toLocaleDateString()}</td>
                      <td>{log.origin}</td>
                      <td>{log.destination}</td>
                      <td>{log.permitNumber || '-'}</td>
                      <td>{log.vehicleRegistration || '-'}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleEditMovement(log)}>✏️</button>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDeleteMovement(log.id)}>🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: JOURNAL */}
      {activeTab === 'journal' && (
        <div className="card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
            <h2>Journal & Notes</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowJournalForm(!showJournalForm)}
              disabled={animal?.status === 'Sold' || animal?.status === 'Deceased'}
              title={animal?.status === 'Sold' || animal?.status === 'Deceased' ? 'Cannot add records to inactive animals' : ''}
            >
              {showJournalForm ? 'Cancel' : 'Add Note'}
            </button>
          </div>
          
          {showJournalForm && (
            <form onSubmit={handleAddJournal} style={{ background: 'var(--surface)', padding: '24px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--border)' }}>
              <h3 style={{ marginBottom: '16px' }}>New Journal Entry</h3>
              <div className="form-group" style={{ marginBottom: '16px', maxWidth: '300px' }}>
                <label className="form-label">Date</label>
                <input type="date" className="form-input" required value={newJournalDate} onChange={e => setNewJournalDate(e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label">Note Details</label>
                <textarea className="form-input" rows={4} placeholder="Record observations, behavior, or general notes..." value={newJournalNote} onChange={e => setNewJournalNote(e.target.value)}></textarea>
              </div>
              
              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg-off)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label className="form-label">Voice Recording (Max 60s)</label>
                
                {!isRecording && !audioBlob && (
                  <button type="button" onClick={startRecording} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: '#ef4444' }}>
                    🎤 Record Audio
                  </button>
                )}
                
                {isRecording && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ height: '12px', width: '12px', borderRadius: '50%', backgroundColor: '#ef4444', animation: 'pulse 1.5s infinite' }}></div>
                    <span style={{ fontWeight: 600, fontFamily: 'monospace', fontSize: '1.2rem' }}>
                      00:{recordingTime.toString().padStart(2, '0')}
                    </span>
                    <button type="button" onClick={stopRecording} className="btn btn-primary" style={{ backgroundColor: '#ef4444' }}>
                      Stop Recording
                    </button>
                  </div>
                )}
                
                {audioBlob && !isRecording && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <audio src={URL.createObjectURL(audioBlob)} controls style={{ width: '100%', maxWidth: '400px' }}></audio>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button type="button" onClick={discardAudio} className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '6px 12px' }}>
                        Discard & Rerecord
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" disabled={!newJournalNote && !audioBlob}>Save Note</button>
            </form>
          )}

          {journalLogs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', background: 'var(--surface)', borderRadius: '8px', border: '1px dashed var(--border)' }}>
              <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>No journal entries found for this animal.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {journalLogs.map((log) => (
                <div key={log.id} style={{ padding: '20px', backgroundColor: 'var(--bg-off)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--primary-dark)', fontSize: '0.875rem' }}>
                      {new Date(log.dateRecorded).toLocaleDateString()}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', border: 'none' }} onClick={() => handleEditJournal(log)}>✏️</button>
                      <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', border: 'none', color: '#ef4444' }} onClick={() => handleDeleteJournal(log.id)}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{log.noteText}</div>
                  {log.audioUrl && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>🎤 Voice Note Attached</div>
                      <audio controls src={supabase.storage.from('audio_notes').getPublicUrl(log.audioUrl).data.publicUrl} style={{ width: '100%', maxWidth: '300px', height: '36px' }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>

    {isBirthModalOpen && animal && (
      <BirthWorkflowModal
        onClose={() => { setIsBirthModalOpen(false); fetchAnimalDetails(); }}
        initialMother={{
          id: animal.id,
          tag_number: animal.tagNumber,
          name: animal.name,
          breed: animal.breed,
          species: animal.species,
          sex: animal.sex,
          current_camp_id: animal.currentCampId,
          is_quarantined: animal.isQuarantined,
          quarantine_end_date: (animal as any).quarantineEndDate,
        }}
      />
    )}
    </>
  );
};

