import { useState, useEffect, useRef } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import * as XLSX from 'xlsx';
import { 
  Edit2, Trash2, X, MoreVertical, Filter, ChevronDown, Users, 
  Check, Clock, AlertCircle, Plus, Search, Mail, UserPlus, 
  UsersRound, Utensils, Table2, Menu, ChevronRight, Home,
  Settings, Bell, Calendar, MessageSquare, Upload, Download, FileSpreadsheet, Play, CheckSquare
} from 'lucide-react';
import {
  getGuests,
  getGuestStats,
  createGuest,
  importGuests,
  updateGuest,
  deleteGuest,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getMenus,
  createMenu,
  updateMenu,
  deleteMenu,
  initGuestData,
  sendInvitationEmails,
  getTutorials,
} from "../../api/client";
import { toast } from "react-hot-toast";
import { useData } from "../../contexts/DataContext";

const statusLabels = {
  pending: "Pendente",
  confirmed: "Confirmado",
  declined: "Recusou",
};

const getStatusColor = (status) => {
  switch (status) {
    case "confirmed":
      return "bg-emerald-500 text-white";
    case "pending":
      return "bg-amber-500 text-white";
    case "declined":
      return "bg-red-500 text-white";
    default:
      return "bg-gray-400 text-white";
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
      return "✓";
    case "pending":
      return "⏳";
    case "declined":
      return "✕";
    default:
      return "•";
  }
};

const getStatusLabel = (status) => statusLabels[status] || status;

const tabs = ["Lista Geral", "Grupos", "Presenças", "Mesas", "Cardápios"];

const mobileTabs = [
  { id: "lista", label: "Lista", icon: Users },
  { id: "grupos", label: "Grupos", icon: UsersRound },
  { id: "presencas", label: "Presenças", icon: Check },
  { id: "mesas", label: "Mesas", icon: Table2 },
  { id: "cardapios", label: "Cardápios", icon: Utensils },
];

const groupColors = [
  "bg-orange-400",
  "bg-pink-400",
  "bg-blue-400",
  "bg-purple-400",
  "bg-teal-400",
  "bg-indigo-400",
  "bg-red-400",
  "bg-green-400",
];

// Helper function to extract YouTube video ID
const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function GuestsPage() {
  const [activeTab, setActiveTab] = useState("Lista Geral");
  const [mobileActiveTab, setMobileActiveTab] = useState("lista");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    totalAdults: 0,
    totalChildren: 0,
    totalBabies: 0,
    confirmed: 0,
    pending: 0,
    declined: 0,
  });
  const [groups, setGroups] = useState([]);
  const [tables, setTables] = useState([]);
  const [menus, setMenus] = useState([]);

  // Mobile states
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [mobileActionMenu, setMobileActionMenu] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);
  const [showGuestDetails, setShowGuestDetails] = useState(false);

  // Modal states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

    const data=useData()
    
    useEffect(()=>{
    
        if(!data.postDialogOpen){
             setShowGuestModal(false);
             setShowGroupModal(false);
             setShowTableModal(false);
             setShowMenuModal(false);
             setShowImportModal(false);
        }
    
    },[data.postDialogOpen])


  const [importedGuests, setImportedGuests] = useState([]);
  const [importStep, setImportStep] = useState(1); // 1: upload, 2: review/edit
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState(null); // Store import result for popup
  const [showImportResultModal, setShowImportResultModal] = useState(false);
  const fileInputRef = useRef(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [showInviteConfirm, setShowInviteConfirm] = useState(false);
  const [invitationMessage, setInvitationMessage] = useState('');
  
  // Guest selection dialog state
  const [showGuestSelect, setShowGuestSelect] = useState(false);
  const [guestSearch, setGuestSearch] = useState('');

  // Tutorial video state
  const [guestsTutorial, setGuestsTutorial] = useState(null);
  const [showTutorialDropdown, setShowTutorialDropdown] = useState(false);
  const [showTutorialDesktop, setShowTutorialDesktop] = useState(false);

  // Tips state
  const [guestsTips, setGuestsTips] = useState([
    'A média de confirmações é de 60% dos convidados',
    'Considere reservar 10% a mais de lugares para imprevistos',
    'Famílias geralmente representam 40% dos convidados'
  ]);

  // Default invitation message
  const defaultInvitationMessage = "Olá! Estamos muito felizes em compartilhar este momento especial contigo. Confirmas a tua presença?";

  // Set default message when invitation modal opens
  useEffect(() => {
    if (showInviteConfirm && !invitationMessage) {
      setInvitationMessage(defaultInvitationMessage);
    }
  }, [showInviteConfirm]);

  // Form states
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    group: "",
    table: "",
    menu: "",
    adults: 1,
    children: 0,
    status: "pending",
    kinship: "",
  });

  const kinshipOptions = [
    "Noivo(a)",
    "Pai",
    "Mãe",
    "Irmão(ã)",
    "Tio(a)",
    "Avô(ó)",
    "Primo(a)",
    "Sobrinho(a)",
    "Amigo(a)",
    "Colega",
    "Outro",
  ];

  const [groupForm, setGroupForm] = useState({
    name: "",
    color: "bg-orange-400",
    description: "",
  });

  const [tableForm, setTableForm] = useState({
    name: "",
    capacity: 8,
  });

  const [menuForm, setMenuForm] = useState({
    name: "",
    description: "",
    isAdult: true,
    price: 0,
  });

  useEffect(() => {
    initializeAndLoadData();
  }, []);

  useEffect(() => {
    if (activeTab === "Lista Geral") {
      loadGuests();
    } else if (activeTab === "Grupos") {
      loadGroups();
    } else if (activeTab === "Mesas") {
      loadTables();
    } else if (activeTab === "Cardápios") {
      loadMenus();
    } else if (activeTab === "Presenças") {
      loadGuests();
    }
  }, [activeTab, search, statusFilter, groupFilter]);

  useEffect(() => {
    // Sync mobile tab with desktop tab
    const tabMapping = {
      "lista": "Lista Geral",
      "grupos": "Grupos",
      "presencas": "Presenças",
      "mesas": "Mesas",
      "cardapios": "Cardápios"
    };
    setActiveTab(tabMapping[mobileActiveTab]);
  }, [mobileActiveTab]);

  const initializeAndLoadData = async () => {
    try {
      setLoading(true);
      
      // Fetch tutorial videos and tips
      try {
        const tutorialsRes = await getTutorials();
        if (tutorialsRes.data?.tutorialVideos?.guests) {
          const videoId = extractYouTubeId(tutorialsRes.data.tutorialVideos.guests);
          setGuestsTutorial({
            url: tutorialsRes.data.tutorialVideos.guests,
            videoId
          });
        }
        // Fetch dynamic tips
        if (tutorialsRes.data?.tips?.guests && tutorialsRes.data.tips.guests.length > 0) {
          setGuestsTips(tutorialsRes.data.tips.guests);
        }
      } catch (tutError) {
        console.log('No tutorial videos or tips available');
      }
      
      await initGuestData();
      await Promise.all([loadGuests(), loadStats(), loadGroups(), loadTables(), loadMenus()]);
    } catch (error) {
      console.error("Error initializing guest data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadGuests = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter !== "all") params.status = statusFilter;
      if (groupFilter !== "all") params.group = groupFilter;

      const response = await getGuests(params);
      setGuests(response.data);
    } catch (error) {
      console.error("Error loading guests:", error);
      toast.error("Erro ao carregar convidados");
    }
  };

  const loadStats = async () => {
    try {
      const response = await getGuestStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error("Error loading groups:", error);
    }
  };

  const loadTables = async () => {
    try {
      const response = await getTables();
      setTables(response.data);
    } catch (error) {
      console.error("Error loading tables:", error);
    }
  };

  const loadMenus = async () => {
    try {
      const response = await getMenus();
      setMenus(response.data);
    } catch (error) {
      console.error("Error loading menus:", error);
    }
  };

  const handleCreateGuest = async (e) => {
    e.preventDefault();
    try {
      const guestData = {
        name: guestForm.name,
        email: guestForm.email || null,
        phone: guestForm.phone || null,
        group: guestForm.group || null,
        table: guestForm.table || null,
        menu: guestForm.menu || null,
        adults: guestForm.adults ?? 1,
        children: guestForm.children ?? 0,
        status: guestForm.status,
        kinship: guestForm.kinship || null,
      };
      
      if (editingGuest) {
        await updateGuest(editingGuest._id, guestData);
        toast.success("Convidado atualizado com sucesso");
      } else {
        await createGuest(guestData);
        toast.success("Convidado adicionado com sucesso");
      }
      setShowGuestModal(false);
      resetGuestForm();
      await loadGuests();
      await loadStats();
    } catch (error) {
      console.error("Error saving guest:", error);
      toast.error("Erro ao salvar convidado");
    }
  };

  const handleEditGuest = (guest) => {
    setEditingGuest(guest);
    setGuestForm({
      name: guest.name || "",
      email: guest.email || "",
      phone: guest.phone || "",
      group: guest.group?._id || "",
      table: guest.table?._id || "",
      menu: guest.menu?._id || "",
      adults: guest.adults ?? 1,
      children: guest.children ?? 0,
      status: guest.status || "pending",
      kinship: guest.kinship || "",
    });
    setShowGuestModal(true);
    setMobileActionMenu(null);
     data.setPostDialogOpen(true)
  };

  const handleViewGuest = (guest) => {
    setSelectedGuest(guest);
    setShowGuestDetails(true);
  };

  const handleDeleteGuest = async (id) => {
    setDeleteConfirm(id);
    setDeleteType('guest');
    setMobileActionMenu(null);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      if (deleteType === 'guest') {
        await deleteGuest(deleteConfirm);
        toast.success("Convidado removido com sucesso");
        await loadGuests();
        await loadStats();
      } else if (deleteType === 'group') {
        await deleteGroup(deleteConfirm);
        toast.success("Grupo removido com sucesso");
        await loadGroups();
      } else if (deleteType === 'table') {
        await deleteTable(deleteConfirm);
        toast.success("Mesa removida com sucesso");
        await loadTables();
      } else if (deleteType === 'menu') {
        await deleteMenu(deleteConfirm);
        toast.success("Cardápio removido com sucesso");
        await loadMenus();
      }
      setShowGuestDetails(false);
    } catch (error) {
      console.error("Error deleting:", error);
      toast.error("Erro ao remover");
    } finally {
      setDeleteConfirm(null);
      setDeleteType(null);
    }
  };

  const resetGuestForm = () => {
    setEditingGuest(null);
    setGuestForm({
      name: "",
      email: "",
      phone: "",
      group: "",
      table: "",
      menu: "",
      adults: 1,
      children: 0,
      status: "pending",
      kinship: "",
    });
  };

  // Group handlers
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroup(editingGroup._id, groupForm);
        toast.success("Grupo atualizado com sucesso");
      } else {
        await createGroup(groupForm);
        toast.success("Grupo criado com sucesso");
      }
      setShowGroupModal(false);
      resetGroupForm();
      await loadGroups();
    } catch (error) {
      console.error("Error saving group:", error);
      toast.error("Erro ao salvar grupo");
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name || "",
      color: group.color || "bg-orange-400",
      description: group.description || "",
    });
    setShowGroupModal(true);
    setMobileActionMenu(null);
     data.setPostDialogOpen(true)
  };

  const handleDeleteGroup = async (id) => {
    setDeleteConfirm(id);
    setDeleteType('group');
    setMobileActionMenu(null);
  };

  const resetGroupForm = () => {
    setEditingGroup(null);
    setGroupForm({ name: "", color: "bg-orange-400", description: "" });
  };

  // Table handlers
  const handleCreateTable = async (e) => {
    e.preventDefault();
    try {
      const tableData = {
        name: tableForm.name,
        capacity: tableForm.capacity ?? 8,
      };
      
      if (editingTable) {
        await updateTable(editingTable._id, tableData);
        toast.success("Mesa atualizada com sucesso");
      } else {
        await createTable(tableData);
        toast.success("Mesa criada com sucesso");
      }
      setShowTableModal(false);
      resetTableForm();
      await loadTables();
    } catch (error) {
      console.error("Error saving table:", error);
      toast.error("Erro ao salvar mesa");
    }
  };

  const handleEditTable = (table) => {
    setEditingTable(table);
    setTableForm({
      name: table.name || "",
      capacity: table.capacity ?? 8,
    });
    setShowTableModal(true);
    setMobileActionMenu(null);
     data.setPostDialogOpen(true)
  };

  const handleDeleteTable = async (id) => {
    setDeleteConfirm(id);
    setDeleteType('table');
    setMobileActionMenu(null);
  };

  const resetTableForm = () => {
    setEditingTable(null);
    setTableForm({ name: "", capacity: 8 });
  };

  // Menu handlers
  const handleCreateMenu = async (e) => {
    e.preventDefault();
    try {
      if (editingMenu) {
        await updateMenu(editingMenu._id, menuForm);
        toast.success("Cardápio atualizado com sucesso");
      } else {
        await createMenu(menuForm);
        toast.success("Cardápio criado com sucesso");
      }
      setShowMenuModal(false);
      resetMenuForm();
       data.setPostDialogOpen(true)
      await loadMenus();
    } catch (error) {
      console.error("Error saving menu:", error);
      toast.error("Erro ao salvar cardápio");
    }
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setMenuForm({
      name: menu.name || "",
      description: menu.description || "",
      isAdult: menu.isAdult !== false,
      price: menu.price || 0,
    });
    setShowMenuModal(true);
    setMobileActionMenu(null);
    
  };

  const handleDeleteMenu = async (id) => {
    setDeleteConfirm(id);
    setDeleteType('menu');
    setMobileActionMenu(null);
  };

  const handleQuickStatusChange = async (guestId, newStatus) => {
    try {
      await updateGuest(guestId, { status: newStatus });
      toast.success("Status atualizado com sucesso");
      await loadGuests();
      await loadStats();
      if (selectedGuest?._id === guestId) {
        setSelectedGuest({ ...selectedGuest, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const resetMenuForm = () => {
    setEditingMenu(null);
    setMenuForm({ name: "", description: "", isAdult: true, price: 0 });
  };

  const handleSendInvitationEmails = async () => {
    setSendingInvites(true);
    setShowInviteConfirm(false);
    const guestIds = selectedGuests.length > 0 ? selectedGuests : guests.filter((g) => g.email).map((g) => g._id);
    
    if (guestIds.length === 0) {
      toast.error("Nenhum convidado com email para enviar convite");
      setSendingInvites(false);
      return;
    }

    try {
      // Strip HTML tags for plain text, or send HTML
      const response = await sendInvitationEmails(guestIds, invitationMessage);
      toast.success(`${response.data.sentCount} convite(s) enviado(s) com sucesso!`);
      if (response.data.withoutEmail > 0) {
        toast.error(`${response.data.withoutEmail} convidado(s) sem email`);
      }
      await loadGuests();
      setSelectedGuests([]);
      setInvitationMessage('');
    } catch (error) {
      console.error("Error sending invitation emails:", error);
      toast.error("Erro ao enviar convites por email");
    } finally {
      setSendingInvites(false);
    }
  };

  const toggleGuestSelection = (guestId) => {
    setSelectedGuests((prev) =>
      prev.includes(guestId)
        ? prev.filter((id) => id !== guestId)
        : [...prev, guestId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedGuests.length === guests.length) {
      setSelectedGuests([]);
    } else {
      setSelectedGuests(guests.map((g) => g._id));
    }
  };

  // Excel Import Functions
  const downloadTemplate = () => {
    // Create data for template
    const data = [
      ['nome completo', 'email', 'telefone', 'numero de adultos', 'numero de criancas', 'Nome do grupo'],
      ['João Silva', 'joao@exemplo.com', '+258840000000', '1', '0', 'Família'],
    ];
    
    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 20 }, // nome completo
      { wch: 25 }, // email
      { wch: 15 }, // telefone
      { wch: 18 }, // numero de adultos
      { wch: 18 }, // numero de criancas
      { wch: 20 }, // Nome do grupo
    ];
    
    XLSX.utils.book_append_sheet(wb, ws, 'Modelo');
    
    // Download as xlsx
    XLSX.writeFile(wb, 'modelo_convidados.xlsx');
  };

  // Proper CSV parser that handles quoted fields
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"';
          i++; // Skip next quote
        } else if (char === '"') {
          inQuotes = false;
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current.trim());
    return result;
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get first sheet
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          
          if (jsonData.length === 0) {
            resolve([]);
            return;
          }
          
          const headers = jsonData[0].map(h => String(h).toLowerCase().trim());
          
          // Map headers to expected fields
          const headerMap = {};
          headers.forEach((header, index) => {
            if (header.includes('nome completo') || header === 'nome') headerMap.name = index;
            else if (header === 'email') headerMap.email = index;
            else if (header.includes('telefone') || header.includes('phone') || header === 'telemovel') headerMap.phone = index;
            else if (header.includes('adultos')) headerMap.adults = index;
            else if (header.includes('crian')) headerMap.children = index;
            else if (header.includes('grupo') || header.includes('group')) headerMap.groupName = index;
          });
          
          const guests = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || row.length === 0) continue;
            
            const guest = {
              id: i,
              name: headerMap.name !== undefined ? String(row[headerMap.name] || '') : '',
              email: headerMap.email !== undefined ? String(row[headerMap.email] || '') : '',
              phone: headerMap.phone !== undefined ? String(row[headerMap.phone] || '') : '',
              adults: headerMap.adults !== undefined ? parseInt(row[headerMap.adults]) || 1 : 1,
              children: headerMap.children !== undefined ? parseInt(row[headerMap.children]) || 0 : 0,
              groupName: headerMap.groupName !== undefined ? String(row[headerMap.groupName] || '') : '',
              status: 'pending',
            };
            
            if (guest.name) {
              guests.push(guest);
            }
          }
          
          resolve(guests);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsProcessing(true);
    try {
      const parsedGuests = await parseExcelFile(file);
      setImportedGuests(parsedGuests);
      setImportStep(2);
      toast.success(`${parsedGuests.length} convidado(s) carregado(s)`);
    } catch (error) {
      console.error('Error parsing file:', error);
      toast.error('Erro ao processar arquivo. Verifique o formato.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdateImportedGuest = (id, field, value) => {
    setImportedGuests(prev => prev.map(g => 
      g.id === id ? { ...g, [field]: value } : g
    ));
  };

  const handleRemoveImportedGuest = (id) => {
    setImportedGuests(prev => prev.filter(g => g.id !== id));
  };

  const handleExportGuests = () => {
    const exportData = guests.map(guest => ({
      'Nome': guest.name,
      'Email': guest.email || '',
      'Telefone': guest.phone || '',
      'Parentesco': guest.kinship || '',
      'Grupo': guest.group?.name || '',
      'Mesa': guest.table?.name || '',
      'Cardápio': guest.menu?.name || '',
      'Adultos': guest.adults,
      'Crianças': guest.children,
      'Status': guest.status === 'confirmed' ? 'Confirmado' : guest.status === 'pending' ? 'Pendente' : 'Recusou',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    ws['!cols'] = [
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Convidados');
    XLSX.writeFile(wb, 'convidados.xlsx');
    toast.success('Convidados exportados com sucesso!');
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    try {
      // Prepare guests data for import
      const guestsData = importedGuests.map(g => ({
        name: g.name,
        email: g.email || '',
        phone: g.phone || '',
        adults: g.adults || 1,
        children: g.children || 0,
        babies: 0,
        groupName: g.groupName || '',
      }));

      // Use batch import API
      const response = await importGuests(guestsData);
      
      // Store result and show popup
      setImportResult({
        successCount: response.data.successCount || 0,
        errorCount: response.data.errorCount || 0,
        duplicateCount: response.data.duplicateCount || 0,
        errors: response.data.errors || [],
        duplicates: response.data.duplicates || [],
      });
      setShowImportResultModal(true);
      setShowImportModal(false);
      
      if (response.data.successCount > 0) {
        await loadGuests();
        await loadStats();
      }

      setImportedGuests([]);
      setImportStep(1);
    } catch (error) {
      console.error('Error importing guests:', error);
      toast.error('Erro ao importar convidados');
    } finally {
      setIsProcessing(false);
    }
  };

  // Simple email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGroupColor = (color) => color || "bg-gray-400";

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DefaultLayout largerPadding={true} hero={{title:"Convidados",subtitle:"Gerencie sua lista de convidados e acompanhe as confirmações"}}>
        <div className="h-[50vh] bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout largerPadding={true} hero={{title:"Convidados",subtitle:"Gerencie sua lista de convidados e acompanhe as confirmações"}}>
      <div className="min-h-screen bg-gray-50">
        {/* Desktop View (hidden on mobile) */}
        <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Desktop Title Row */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Convidados</h1>
            </div>
           
           <div className="flex gap-2 items-center">
             <button
              onClick={() => {
                resetGuestForm();
                setShowGuestModal(true);
                 data.setPostDialogOpen(true)
              }}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
            >
              <span className="text-lg leading-none">+</span>
              <span>Adicionar Convidado</span>
            </button>
            <button
              onClick={() => {
                setImportStep(1);
                setImportedGuests([]);
                setShowImportModal(true);
                 data.setPostDialogOpen(true)
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition flex items-center space-x-2"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </button>
            <button
              onClick={handleExportGuests}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-600 transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
           </div>
          </div>

          {/* Tutorial Video - Mobile Only */}
          {guestsTutorial && (
            <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowTutorialDropdown(!showTutorialDropdown)}
                className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                  <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                  <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showTutorialDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showTutorialDropdown && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.youtube.com/embed/${guestsTutorial.videoId}`}
                    title="Tutorial Video"
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Desktop Stats Cards */}
              <div className="hidden lg:grid grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Total Convidados</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-lg">
                      👥
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Confirmados</p>
                      <p className="text-2xl font-bold text-emerald-600">{stats.confirmed}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-lg">
                      ✓
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Pendentes</p>
                      <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-lg">
                      ⏳
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Recusaram</p>
                      <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg">
                      ✕
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Filters */}
              <div className="hidden lg:flex flex-row items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar convidado..."
                    className="w-full text-gray-800 pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={groupFilter}
                  onChange={(e) => setGroupFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
                >
                  <option value="all">Todos os grupos</option>
                  {groups.map((group) => (
                    <option key={group._id} value={group._id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
                >
                  <option value="all">Todos os status</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendente</option>
                  <option value="declined">Recusou</option>
                </select>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => setShowGuestSelect(true)}
                    disabled={sendingInvites}
                    className="flex items-center justify-center gap-1.5 bg-green-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    {sendingInvites ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span>Enviar Convites</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      resetGroupForm();
                      setShowGroupModal(true);
                       data.setPostDialogOpen(true)
                    }}
                    className="flex items-center justify-center gap-1.5 bg-primary-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Grupo</span>
                  </button>
                </div>
              </div>

              {/* Desktop Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="flex border-b border-gray-100 px-4">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-3 text-sm font-medium transition-colors relative ${
                        activeTab === tab ? "text-primary-600" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {tab}
                      {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Tab Content */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4">
                  {/* Desktop Lista Geral Tab */}
                  {activeTab === "Lista Geral" && (
                    <div className="divide-y divide-gray-50">
                      {filteredGuests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          Nenhum convidado encontrado. Adicione seu primeiro convidado!
                        </div>
                      ) : (
                        <>
                          {filteredGuests.map((guest) => (
                            <div
                              key={guest._id}
                              className="flex items-center px-4 py-4 hover:bg-gray-50 transition-colors group"
                            >
                              <div
                                className={`w-10 h-10 rounded-full ${getGroupColor(
                                  guest.group?.color
                                )} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                              >
                                {getInitials(guest.name)}
                              </div>

                              <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900">{guest.name}</p>
                                <p className="text-xs text-gray-500">
                                  {guest.email || "Sem email"} • {guest.group?.name || "Sem grupo"}
                                  {guest.kinship && <> • {guest.kinship}</>}
                                </p>
                              </div>

                              <div className="flex items-center gap-6 mr-6">
                                <div className="text-center">
                                  <p className="text-xs text-gray-400">Adultos</p>
                                  <p className="text-sm font-semibold text-gray-700">{guest.adults}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-xs text-gray-400">Crianças</p>
                                  <p className="text-sm font-semibold text-gray-700">{guest.children}</p>
                                </div>
                              </div>

                              <div className="w-24 relative">
                                <select
                                  value={guest.status}
                                  onChange={(e) => handleQuickStatusChange(guest._id, e.target.value)}
                                  className={`${getStatusColor(guest.status)} px-3 py-1 rounded-lg text-xs font-medium w-full text-center cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                >
                                  <option value="pending">Pendente</option>
                                  <option value="confirmed">Confirmado</option>
                                  <option value="declined">Recusou</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <button
                                  onClick={() => handleEditGuest(guest)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Editar"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGuest(guest._id)}
                                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}

                  {/* Desktop Grupos Tab */}
                  {activeTab === "Grupos" && (
                    <div>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => {
                            resetGroupForm();
                            setShowGroupModal(true);
                             data.setPostDialogOpen(true)
                          }}
                          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600"
                        >
                          + Novo Grupo
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {groups.map((group) => (
                          <div
                            key={group._id}
                            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-4 h-4 rounded-full ${group.color}`}></div>
                              <div>
                                <p className="font-medium text-gray-900">{group.name}</p>
                                {group.description && (
                                  <p className="text-sm text-gray-500">{group.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditGroup(group)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group._id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {groups.length === 0 && (
                          <p className="text-gray-500 col-span-2 text-center py-4">
                            Nenhum grupo criado ainda.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Desktop Mesas Tab */}
                  {activeTab === "Mesas" && (
                    <div>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex flex-wrap gap-2">
                          <div className="bg-primary-50 rounded-lg px-3 py-2 text-center">
                            <span className="text-xs text-gray-600 block">Total lugares</span>
                            <span className="font-semibold text-gray-900">{tables.reduce((acc, t) => acc + t.capacity, 0)}</span>
                          </div>
                          <div className="bg-emerald-50 rounded-lg px-3 py-2 text-center">
                            <span className="text-xs text-gray-600 block">Ocupados</span>
                            <span className="font-semibold text-emerald-600">{tables.reduce((acc, t) => acc + (t.guestCount || 0), 0)}</span>
                          </div>
                          <div className="bg-amber-50 rounded-lg px-3 py-2 text-center">
                            <span className="text-xs text-gray-600 block">Disponíveis</span>
                            <span className="font-semibold text-amber-600">{tables.reduce((acc, t) => acc + (t.availableSeats || 0), 0)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            resetTableForm();
                            setShowTableModal(true);
                             data.setPostDialogOpen(true)
                          }}
                          className="bg-primary-500 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-primary-600 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Nova Mesa
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {tables.map((table) => {
                          const occupancyPercent = table.capacity > 0 ? ((table.guestCount || 0) / table.capacity) * 100 : 0;
                          const isFull = occupancyPercent >= 100;
                          const isAlmostFull = occupancyPercent >= 80 && occupancyPercent < 100;
                          
                          return (
                            <div
                              key={table._id}
                              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                            >
                              {/* Table Header */}
                              <div className="bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                      </svg>
                                    </div>
                                    <h3 className="font-semibold text-white">{table.name}</h3>
                                  </div>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleEditTable(table)}
                                      className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                                    >
                                      <Edit2 className="w-4 h-4 text-white" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteTable(table._id)}
                                      className="p-1.5 bg-white/20 hover:bg-red-500 rounded-lg transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4 text-white" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Table Content */}
                              <div className="p-4">
                                <div className="mb-4">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-gray-600">Ocupação</span>
                                    <span className={`text-sm font-medium ${isFull ? 'text-red-600' : isAlmostFull ? 'text-amber-600' : 'text-emerald-600'}`}>
                                      {table.guestCount || 0} / {table.capacity}
                                    </span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isFull ? 'bg-red-500' : isAlmostFull ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Capacidade</p>
                                    <p className="text-lg font-bold text-gray-900">{table.capacity}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Disponíveis</p>
                                    <p className={`text-lg font-bold ${table.availableSeats > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                      {table.availableSeats}
                                    </p>
                                  </div>
                                </div>
                                
                                {table.guests && table.guests.length > 0 && (
                                  <div>
                                    <p className="text-xs text-gray-500 mb-2">Convidados:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {table.guests.slice(0, 3).map((guest, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-full">
                                          {guest.name.split(' ')[0]}
                                        </span>
                                      ))}
                                      {table.guests.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                          +{table.guests.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        {tables.length === 0 && (
                          <div className="col-span-full">
                            <div className="bg-gray-50 rounded-xl p-8 text-center">
                              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                              </div>
                              <p className="text-gray-500 mb-4">Nenhuma mesa criada ainda.</p>
                              <button
                                onClick={() => {
                                  resetTableForm();
                                  setShowTableModal(true);
                                   data.setPostDialogOpen(true)
                                }}
                                className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600 inline-flex items-center gap-2"
                              >
                                <Plus className="w-4 h-4" />
                                Criar primeira mesa
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Desktop Cardápios Tab */}
                  {activeTab === "Cardápios" && (
                    <div>
                      <div className="flex justify-end mb-4">
                        <button
                          onClick={() => {
                            resetMenuForm();
                            setShowMenuModal(true);
                             data.setPostDialogOpen(true)
                          }}
                          className="bg-primary-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-600"
                        >
                          + Novo Cardápio
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menus.map((menu) => (
                          <div
                            key={menu._id}
                            className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {menu.name}
                                {menu.isAdult ? (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                    Adulto
                                  </span>
                                ) : (
                                  <span className="ml-2 text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                                    Criança
                                  </span>
                                )}
                              </p>
                              {menu.description && (
                                <p className="text-sm text-gray-500">{menu.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditMenu(menu)}
                                className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteMenu(menu._id)}
                                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {menus.length === 0 && (
                          <p className="text-gray-500 col-span-2 text-center py-4">
                            Nenhum cardápio criado ainda.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Desktop Presenças Tab */}
                  {activeTab === "Presenças" && (
                    <div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="w-6 h-6 text-emerald-600" />
                          </div>
                          <p className="text-3xl font-bold text-emerald-600">{stats.confirmed}</p>
                          <p className="text-sm text-emerald-600 font-medium">Confirmados</p>
                          <p className="text-lg font-semibold text-emerald-700 mt-2">
                            {guests
                              .filter((g) => g.status === "confirmed")
                              .reduce((acc, g) => acc + g.adults + g.children, 0)}{" "}
                            pessoas
                          </p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-amber-600" />
                          </div>
                          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
                          <p className="text-sm text-amber-600 font-medium">Pendentes</p>
                          <p className="text-lg font-semibold text-amber-700 mt-2">
                            {guests
                              .filter((g) => g.status === "pending")
                              .reduce((acc, g) => acc + g.adults + g.children, 0)}{" "}
                            pessoas
                          </p>
                        </div>
                        <div className="bg-red-50 rounded-xl p-6 text-center">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="w-6 h-6 text-red-600" />
                          </div>
                          <p className="text-3xl font-bold text-red-600">{stats.declined}</p>
                          <p className="text-sm text-red-600 font-medium">Recusaram</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Desktop Tip */}
              <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-sm">💡</span>
                </div>
                <p className="text-sm text-gray-700">
                  Envie lembretes para convidados pendentes{" "}
                  <span className="font-semibold">7 dias antes</span> do casamento para aumentar a
                  taxa de confirmação.
                </p>
              </div>
            </div>

            {/* Desktop Right Column - Smart Tips */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                
               

                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Dicas inteligentes</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {guestsTips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>

                 {/* Tutorial Video - Desktop Only */}
                {guestsTutorial && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowTutorialDesktop(!showTutorialDesktop)}
                      className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                        <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                        <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showTutorialDesktop ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showTutorialDesktop && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${guestsTutorial.videoId}`}
                          title="Tutorial Video"
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-6 mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de adultos:</span>
                      <span className="font-semibold text-gray-900">{stats.totalAdults}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de crianças:</span>
                      <span className="font-semibold text-gray-900">{stats.totalChildren}</span>
                    </div>
                  
                    <div className="flex justify-between pt-2 border-t border-gray-100">
                      <span className="text-gray-600">Total de pessoas:</span>
                      <span className="font-semibold text-primary-600">
                        {stats.totalAdults + stats.totalChildren + stats.totalBabies}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    resetGuestForm();
                    setShowGuestModal(true);
                     data.setPostDialogOpen(true)
                  }}
                  className="w-full bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Adicionar convidado</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View (visible only on mobile) */}
        <div className="lg:hidden min-h-screen bg-gray-50 pb-20">
          {/* Mobile Header */}
          <div className="bg-white border-b border-gray-200 z-30">
            <div className="px-4 py-3 flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Meus convidados</h1>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowGuestSelect(true)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Mail className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => {
                    setImportStep(1);
                    setImportedGuests([]);
                    setShowImportModal(true);
                     data.setPostDialogOpen(true)
                  }}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Upload className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleExportGuests}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Stats Cards */}
         
         
         <div className="px-4 pb-3">
  <div className="grid grid-cols-2 gap-2">
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center mb-1">
          <Users className="w-4 h-4" />
        </div>
        <p className="text-xs text-gray-500 text-center">Total</p>
        <p className="text-lg font-bold text-gray-900">{stats.total}</p>
      </div>
    </div>
    
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
          <Check className="w-4 h-4" />
        </div>
        <p className="text-xs text-gray-500 text-center">Confirmados</p>
        <p className="text-lg font-bold text-emerald-600">{stats.confirmed}</p>
      </div>
    </div>
    
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-1">
          <Clock className="w-4 h-4" />
        </div>
        <p className="text-xs text-gray-500 text-center">Pendentes</p>
        <p className="text-lg font-bold text-amber-600">{stats.pending}</p>
      </div>
    </div>
    
    <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-1">
          <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-xs text-gray-500 text-center">Recusaram</p>
        <p className="text-lg font-bold text-red-600">{stats.declined}</p>
      </div>
    </div>
  </div>
</div>


             <div className="sticky top-0 z-30">


              


               {/* Mobile Search and Filter */}
            <div className="px-4 pb-3">

               {/* Tutorial Video - Desktop Only */}
                {guestsTutorial && (
                  <div className="mb-6">
                    <button
                      onClick={() => setShowTutorialDesktop(!showTutorialDesktop)}
                      className="w-full flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-100 hover:bg-primary-100 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Play className="w-5 h-5 text-primary-500" fill="currentColor" />
                        <span className="text-sm font-medium text-primary-700">Ver tutorial</span>
                        <span className="text-xs text-primary-600 ml-1">(como usar esta página)</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-primary-500 transition-transform ${showTutorialDesktop ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showTutorialDesktop && (
                      <div className="mt-2 rounded-lg overflow-hidden">
                        <iframe
                          src={`https://www.youtube.com/embed/${guestsTutorial.videoId}`}
                          title="Tutorial Video"
                          className="w-full aspect-video"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}
                  </div>
                )}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar..."
                    className="w-full text-gray-800 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className={`p-2.5 border border-gray-200 rounded-xl bg-gray-50 ${
                    showMobileFilters ? 'bg-primary-500 border-primary-500 text-white' : 'text-gray-600'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Expanded Filters */}
              {showMobileFilters && (
                <div className="mt-3 space-y-2 animate-slide-down">
                  <select
                    value={groupFilter}
                    onChange={(e) => setGroupFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700"
                  >
                    <option value="all">Todos os grupos</option>
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white text-gray-700"
                  >
                    <option value="all">Todos os status</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="pending">Pendente</option>
                    <option value="declined">Recusou</option>
                  </select>
                </div>
              )}
            </div>

            {/* Mobile Tabs */}
            <div className="px-4 border-b border-gray-200">
              <div className="flex -mb-px">
                {mobileTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = mobileActiveTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setMobileActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center py-3 border-b-2 text-xs font-medium transition-colors ${
                        isActive 
                          ? "border-primary-500 text-primary-500" 
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>


             </div>
           
          </div>

          {/* Mobile Content */}
          <div className="px-4 py-4">
            {/* Mobile Lista Tab */}
            {mobileActiveTab === "lista" && (
              <div className="space-y-3">
                {filteredGuests.length === 0 ? (
                  <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-4">Nenhum convidado encontrado</p>
                    <button
                      onClick={() => {
                        resetGuestForm();
                        setShowGuestModal(true);
                         data.setPostDialogOpen(true)
                      }}
                      className="bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" />
                      Adicionar Convidado
                    </button>
                  </div>
                ) : (
                  filteredGuests.map((guest) => (
                    <div
                      key={guest._id}
                      onClick={() => handleViewGuest(guest)}
                      className="bg-white rounded-2xl border border-gray-100 p-4 active:bg-gray-50 transition-colors cursor-pointer shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-12 h-12 rounded-2xl ${getGroupColor(
                            guest.group?.color
                          )} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}
                        >
                          {getInitials(guest.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold text-gray-900 text-base mb-1">{guest.name}</p>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <span className={`inline-block w-2 h-2 rounded-full ${
                                  guest.status === 'confirmed' ? 'bg-emerald-500' :
                                  guest.status === 'pending' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                                {getStatusLabel(guest.status)}
                                {guest.group?.name && (
                                  <>
                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                    {guest.group.name}
                                  </>
                                )}
                              </p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-500">Adultos:</span>
                              <span className="text-sm font-semibold text-gray-900">{guest.adults}</span>
                            </div>
                            {guest.children > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Crianças:</span>
                                <span className="text-sm font-semibold text-gray-900">{guest.children}</span>
                              </div>
                            )}
                            {guest.babies > 0 && (
                              <div className="flex items-center gap-1">
                                <span className="text-xs text-gray-500">Bebês:</span>
                                <span className="text-sm font-semibold text-gray-900">{guest.babies}</span>
                              </div>
                            )}
                          </div>

                          {guest.email && (
                            <p className="text-xs text-gray-400 mt-2 truncate">
                              {guest.email}
                            </p>
                          )}
                          {guest.kinship && (
                            <p className="text-xs text-primary-600 mt-1 font-medium">
                              {guest.kinship}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Mobile Grupos Tab */}
            {mobileActiveTab === "grupos" && (
              <div>
                <button
                  onClick={() => {
                    resetGroupForm();
                    setShowGroupModal(true);
                     data.setPostDialogOpen(true)
                  }}
                  className="w-full bg-primary-500 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Novo Grupo
                </button>
                
                <div className="space-y-3">
                  {groups.map((group) => (
                    <div
                      key={group._id}
                      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${group.color}`}></div>
                          <div>
                            <p className="font-medium text-gray-900">{group.name}</p>
                            {group.description && (
                              <p className="text-xs text-gray-500 mt-1">{group.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditGroup(group)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGroup(group._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {groups.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UsersRound className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600">Nenhum grupo criado ainda</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Presenças Tab */}
            {mobileActiveTab === "presencas" && (
              <div>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900">Resumo de Presenças</h3>
                      <Check className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Confirmados</span>
                        <span className="font-bold text-emerald-600 text-lg">{stats.confirmed}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Pendentes</span>
                        <span className="font-bold text-amber-600 text-lg">{stats.pending}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Recusaram</span>
                        <span className="font-bold text-red-600 text-lg">{stats.declined}</span>
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900">Total de pessoas</span>
                          <span className="font-bold text-primary-500 text-lg">
                            {stats.totalAdults + stats.totalChildren + stats.totalBabies}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h3 className="font-semibold text-gray-900 mb-4">Detalhamento</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Adultos</span>
                        <span className="font-medium text-gray-900">{stats.totalAdults}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Crianças</span>
                        <span className="font-medium text-gray-900">{stats.totalChildren}</span>
                      </div>
                      <div className="flex justify-between text-sm hidden">
                        <span className="text-gray-600">Bebês</span>
                        <span className="font-medium text-gray-900">{stats.totalBabies}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Mesas Tab */}
            {mobileActiveTab === "mesas" && (
              <div>
                <button
                  onClick={() => {
                    resetTableForm();
                    setShowTableModal(true);
                     data.setPostDialogOpen(true)
                  }}
                  className="w-full bg-primary-500 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Nova Mesa
                </button>

                <div className="space-y-4">
                  {tables.map((table) => {
                    const occupancyPercent = table.capacity > 0 ? ((table.guestCount || 0) / table.capacity) * 100 : 0;
                    const isFull = occupancyPercent >= 100;
                    
                    return (
                      <div
                        key={table._id}
                        className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-500/10 rounded-xl flex items-center justify-center">
                              <Table2 className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{table.name}</h3>
                              <p className="text-xs text-gray-500">Capacidade: {table.capacity}</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditTable(table)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTable(table._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Ocupação</span>
                            <span className={`font-medium ${
                              isFull ? 'text-red-600' : 'text-emerald-600'
                            }`}>
                              {table.guestCount || 0} / {table.capacity}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${
                                isFull ? 'bg-red-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {tables.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Table2 className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600 mb-4">Nenhuma mesa criada ainda</p>
                      <button
                        onClick={() => {
                          resetTableForm();
                          setShowTableModal(true);
                           data.setPostDialogOpen(true)
                        }}
                        className="bg-primary-500 text-white px-6 py-3 rounded-xl text-sm font-medium inline-flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Criar primeira mesa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Cardápios Tab */}
            {mobileActiveTab === "cardapios" && (
              <div>
                <button
                  onClick={() => {
                    resetMenuForm();
                    setShowMenuModal(true);
                     data.setPostDialogOpen(true)
                  }}
                  className="w-full bg-primary-500 text-white px-4 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 mb-4"
                >
                  <Plus className="w-4 h-4" />
                  Novo Cardápio
                </button>

                <div className="space-y-3">
                  {menus.map((menu) => (
                    <div
                      key={menu._id}
                      className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{menu.name}</p>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              menu.isAdult 
                                ? 'bg-blue-100 text-blue-600' 
                                : 'bg-purple-100 text-purple-600'
                            }`}>
                              {menu.isAdult ? 'Adulto' : 'Criança'}
                            </span>
                          </div>
                          {menu.description && (
                            <p className="text-xs text-gray-500 mt-1">{menu.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMenu(menu)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMenu(menu._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {menus.length === 0 && (
                    <div className="bg-white rounded-2xl p-8 text-center border border-gray-100">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-10 h-10 text-gray-400" />
                      </div>
                      <p className="text-gray-600">Nenhum cardápio criado ainda</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile FAB */}
          <button
            onClick={() => {
              setShowAddMenu(true)
              data.setPostDialogOpen(true)
            }}
            className="fixed bottom-20 right-4 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors z-40"
          >
            <Plus className="w-6 h-6" />
          </button>

        

          {/* Mobile Add Menu Bottom Sheet */}
          {showAddMenu && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowAddMenu(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up">
                <div className="p-4">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Adicionar</h3>
                  <div className="space-y-3">
                    <button

                      onClick={() => {
                        setShowAddMenu(false);
                        resetGuestForm();
                        setShowGuestModal(true);
                        data.setPostDialogOpen(true)
                      }}

                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl"
                    >

                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                        <UserPlus className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">Novo Convidado</p>
                        <p className="text-xs text-gray-500">Adicionar convidado à lista</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        resetGroupForm();
                        setShowGroupModal(true);
                         data.setPostDialogOpen(true)
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                        <UsersRound className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">Novo Grupo</p>
                        <p className="text-xs text-gray-500">Criar um novo grupo</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        resetTableForm();
                        setShowTableModal(true);
                         data.setPostDialogOpen(true)
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                        <Table2 className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">Nova Mesa</p>
                        <p className="text-xs text-gray-500">Adicionar uma mesa</p>
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddMenu(false);
                        resetMenuForm();
                        setShowMenuModal(true);
                      }}
                      className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 rounded-xl"
                    >
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium text-gray-900">Novo Cardápio</p>
                        <p className="text-xs text-gray-500">Criar um cardápio</p>
                      </div>
                    </button>
                  </div>
                  <button
                    onClick={() => setShowAddMenu(false)}
                    className="w-full mt-4 p-4 text-gray-500 font-medium border-t border-gray-100"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Mobile Guest Details Bottom Sheet */}
          {showGuestDetails && selectedGuest && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowGuestDetails(false)}
              />
              <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 animate-slide-up max-h-[80vh] overflow-y-auto">
                <div className="p-4">
                  <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl ${getGroupColor(
                        selectedGuest.group?.color
                      )} flex items-center justify-center text-white text-2xl font-bold`}
                    >
                      {getInitials(selectedGuest.name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900">{selectedGuest.name}</h3>
                      <p className="text-sm text-gray-500">{selectedGuest.group?.name || "Sem grupo"}</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-xs text-gray-500 mb-2">Status</p>
                      <select
                        value={selectedGuest.status}
                        onChange={(e) => handleQuickStatusChange(selectedGuest._id, e.target.value)}
                        className={`${getStatusColor(selectedGuest.status)} px-4 py-2 rounded-lg text-sm font-medium w-full text-center cursor-pointer appearance-none`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="declined">Recusou</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Adultos</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedGuest.adults}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center">
                        <p className="text-xs text-gray-500 mb-1">Crianças</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedGuest.children}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 text-center hidden">
                        <p className="text-xs text-gray-500 mb-1">Bebês</p>
                        <p className="text-2xl font-bold text-gray-900">{selectedGuest.babies}</p>
                      </div>
                    </div>

                    {selectedGuest.email && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Email</p>
                        <p className="text-gray-900">{selectedGuest.email}</p>
                      </div>
                    )}

                    {selectedGuest.phone && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Telefone</p>
                        <p className="text-gray-900">{selectedGuest.phone}</p>
                      </div>
                    )}

                    {selectedGuest.table && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Mesa</p>
                        <p className="text-gray-900">{selectedGuest.table.name}</p>
                      </div>
                    )}

                    {selectedGuest.menu && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Cardápio</p>
                        <p className="text-gray-900">{selectedGuest.menu.name}</p>
                      </div>
                    )}

                    {selectedGuest.kinship && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">Parentesco</p>
                        <p className="text-gray-900">{selectedGuest.kinship}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowGuestDetails(false);
                        handleEditGuest(selectedGuest);
                      }}
                      className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        setShowGuestDetails(false);
                        handleDeleteGuest(selectedGuest._id);
                      }}
                      className="flex-1 bg-red-500 text-white py-3 rounded-xl font-medium hover:bg-red-600"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Global Modals - These work for both desktop and mobile */}

        {/* Guest Modal */}
        {showGuestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingGuest ? "Editar Convidado" : "Adicionar Convidado"}
                </h2>
                <button 
                  onClick={() => { setShowGuestModal(false); resetGuestForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateGuest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={guestForm.name}
                    onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="+258"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Adultos</label>
                    <input
                      type="number"
                      min="1"
                      value={guestForm.adults}
                      onChange={(e) => setGuestForm({ ...guestForm, adults: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Crianças</label>
                    <input
                      type="number"
                      min="0"
                      value={guestForm.children}
                      onChange={(e) => setGuestForm({ ...guestForm, children: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    />
                  </div>
                  <div className="hidden">
                    <label className="block text-sm font-medium text-gray-900 mb-1">Bebês</label>
                    <input
                      type="number"
                      min="0"
                      value={guestForm.babies}
                      onChange={(e) => setGuestForm({ ...guestForm, babies: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Grupo *</label>
                  <select
                    required
                    value={guestForm.group}
                    onChange={(e) => setGuestForm({ ...guestForm, group: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="">Selecione...</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Mesa</label>
                  <select
                    value={guestForm.table}
                    onChange={(e) => setGuestForm({ ...guestForm, table: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="">Selecione...</option>
                    {tables.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Cardápio</label>
                  <select
                    value={guestForm.menu}
                    onChange={(e) => setGuestForm({ ...guestForm, menu: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="">Selecione...</option>
                    {menus.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
                  <select
                    value={guestForm.status}
                    onChange={(e) => setGuestForm({ ...guestForm, status: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="declined">Recusou</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Parentesco</label>
                  <select
                    value={guestForm.kinship}
                    onChange={(e) => setGuestForm({ ...guestForm, kinship: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="">Selecione...</option>
                    {kinshipOptions.map((kinship) => (
                      <option key={kinship} value={kinship}>
                        {kinship}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuestModal(false);
                      resetGuestForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                  >
                    {editingGuest ? "Atualizar" : "Adicionar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Group Modal */}
        {showGroupModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingGroup ? "Editar Grupo" : "Novo Grupo"}
                </h2>
                <button 
                  onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateGroup} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={groupForm.name}
                    onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Nome do grupo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {groupColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setGroupForm({ ...groupForm, color })}
                        className={`w-10 h-10 rounded-xl ${color} ${
                          groupForm.color === color ? "ring-2 ring-offset-2 ring-primary-500" : ""
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Descrição</label>
                  <textarea
                    value={groupForm.description}
                    onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    rows={2}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupModal(false);
                      resetGroupForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                  >
                    {editingGroup ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table Modal */}
        {showTableModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingTable ? "Editar Mesa" : "Nova Mesa"}
                </h2>
                <button 
                  onClick={() => { setShowTableModal(false); resetTableForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateTable} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={tableForm.name}
                    onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Ex: Mesa 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Capacidade</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableForm.capacity}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || 8 })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTableModal(false);
                      resetTableForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                  >
                    {editingTable ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Menu Modal */}
        {showMenuModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingMenu ? "Editar Cardápio" : "Novo Cardápio"}
                </h2>
                <button 
                  onClick={() => { setShowMenuModal(false); resetMenuForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleCreateMenu} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={menuForm.name}
                    onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Nome do cardápio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Descrição</label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    rows={2}
                    placeholder="Descrição do menu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Tipo</label>
                  <select
                    value={menuForm.isAdult ? "adult" : "child"}
                    onChange={(e) => setMenuForm({ ...menuForm, isAdult: e.target.value === "adult" })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="adult">Adulto</option>
                    <option value="child">Criança</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuModal(false);
                      resetMenuForm();
                    }}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600"
                  >
                    {editingMenu ? "Atualizar" : "Criar"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Confirmar exclusão</h3>
              <p className="text-gray-600 text-center mb-6">
                {deleteType === 'guest' && "Tem certeza que deseja excluir este convidado? Esta ação não pode ser desfeita."}
                {deleteType === 'group' && "Tem certeza que deseja excluir este grupo? Os convidados deste grupo ficarão sem grupo."}
                {deleteType === 'table' && "Tem certeza que deseja excluir esta mesa? Os convidados nesta mesa ficarão sem mesa."}
                {deleteType === 'menu' && "Tem certeza que deseja excluir este cardápio? Os convidados com este cardápio ficarão sem cardápio."}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null);
                    setDeleteType(null);
                  }}
                  className="flex-1 text-gray-500 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-medium"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Invitation Confirmation Modal */}
        {showInviteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <button 
                onClick={() => { setShowInviteConfirm(false); setInvitationMessage(''); }}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4 mt-2">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Enviar Convites</h3>
              <p className="text-gray-600 text-center mb-6">
                {selectedGuests.length > 0 
                  ? `Tem certeza que deseja enviar convites para ${selectedGuests.length} convidado(s) selecionado(s)?`
                  : "Tem certeza que deseja enviar convites para todos os convidados com email?"}
              </p>
              
              {/* Custom Message Editor */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Mensagem personalizada (opcional)
                </label>
                <textarea
                  value={invitationMessage}
                  onChange={(e) => setInvitationMessage(e.target.value)}
                  placeholder="Escreva uma mensagem personalizada para os seus convidados..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Esta mensagem será incluída no convite de email enviado aos convidados.
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowInviteConfirm(false); setInvitationMessage(''); }}
                  className="flex-1 text-gray-500 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendInvitationEmails}
                  disabled={sendingInvites}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium disabled:opacity-50"
                >
                  {sendingInvites ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Guest Selection Modal */}
        {showGuestSelect && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">Selecionar Convidados</h2>
                <button 
                  onClick={() => { setShowGuestSelect(false); setGuestSearch(''); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Search and Select All */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    placeholder="Buscar convidado..."
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-black text-sm"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={toggleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    <CheckSquare className="w-4 h-4" />
                    {selectedGuests.length === guests.length ? 'Desmarcar todos' : 'Selecionar todos'}
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedGuests.length} selecionado(s)
                  </span>
                </div>
              </div>
              
              {/* Guest List */}
              <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl max-h-[40vh]">
                {filteredGuests
                  .filter(g => g.email || g.phone)
                  .filter(g => !guestSearch || g.name.toLowerCase().includes(guestSearch.toLowerCase()))
                  .map((guest) => (
                    <div 
                      key={guest._id}
                      onClick={() => toggleGuestSelection(guest._id)}
                      className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0 ${
                        selectedGuests.includes(guest._id) ? 'bg-green-50' : ''
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        selectedGuests.includes(guest._id) 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-300'
                      }`}>
                        {selectedGuests.includes(guest._id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{guest.name}</p>
                        <p className="text-xs text-gray-500">{guest.email && guest.phone ? `${guest.email} • ${guest.phone}` : guest.email || guest.phone || 'Sem contacto'}</p>
                      </div>
                      {guest.status === 'confirmed' && (
                        <span className="text-xs bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full">
                          Confirmado
                        </span>
                      )}
                      {guest.status === 'pending' && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full">
                          Pendente
                        </span>
                      )}
                      {guest.status === 'declined' && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                          Recusou
                        </span>
                      )}
                    </div>
                  ))}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => {
                    setShowGuestSelect(false);
                    setGuestSearch('');
                  }}
                  className="flex-1 text-gray-500 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    if (selectedGuests.length === 0) {
                      // If no guests selected, send to all
                      setShowGuestSelect(false);
                      setShowInviteConfirm(true);
                    } else {
                      setShowGuestSelect(false);
                      setShowInviteConfirm(true);
                    }
                    setGuestSearch('');
                  }}
                  className="flex-1 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 font-medium"
                >
                  {selectedGuests.length > 0 
                    ? `Enviar para ${selectedGuests.length} selecionado(s)` 
                    : 'Enviar para todos'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Guests Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {importStep === 1 ? 'Importar Convidados' : 'Revisar Convidados'}
                </h2>
                <button 
                  onClick={() => { setShowImportModal(false); setImportStep(1); setImportedGuests([]); }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {importStep === 1 ? (
                /* Step 1: Download Template and Upload */
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <FileSpreadsheet className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900 mb-1">Modelo de Importação</p>
                        <p className="text-sm text-gray-600 mb-3">
                          Baixe o modelo Excel e preencha com os dados dos convidados. O ficheiro deve conter as colunas: nome completo, email, telefone, numero de adultos, numero de criancas, Nome do grupo.
                        </p>
                        <button
                          onClick={downloadTemplate}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <Download className="w-4 h-4" />
                          Baixar Modelo Excel
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".xlsx,.xls"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-700 font-medium mb-2">
                      Arraste o ficheiro aqui ou
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
                    >
                      Selecionar Ficheiro
                    </button>
                    <p className="text-xs text-gray-500 mt-3">
                      Formatos aceitos: XLSX, XLS
                    </p>
                  </div>

                  {isProcessing && (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">A processar...</span>
                    </div>
                  )}
                </div>
              ) : (
                /* Step 2: Review and Edit */
                <div className="flex-1 overflow-hidden flex flex-col">
                  <p className="text-sm text-gray-600 mb-3">
                    Revise os dados antes de importar. Apenas o <strong>nome</strong> é obrigatório. 
                    Pode editar os campos diretamente na tabela abaixo.
                  </p>

                  <div className="flex-1 overflow-y-auto border border-gray-200 rounded-xl">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Nome *</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Email</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Telefone</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600">Adultos</th>
                          <th className="px-3 py-2 text-center font-medium text-gray-600">Crianças</th>
                          <th className="px-3 py-2 text-left font-medium text-gray-600">Grupo</th>
                          <th className="px-2 py-2"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {importedGuests.map((guest) => (
                          <tr key={guest.id} className="hover:bg-gray-50">
                            <td className="px-2 py-2">
                              <input
                                type="text"
                                value={guest.name || ''}
                                onChange={(e) => handleUpdateImportedGuest(guest.id, 'name', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                                placeholder="Nome obrigatório"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="email"
                                value={guest.email || ''}
                                onChange={(e) => handleUpdateImportedGuest(guest.id, 'email', e.target.value)}
                                className={`w-full px-2 py-1 border rounded text-black text-sm ${guest.email && !isValidEmail(guest.email) ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder={guest.email && !isValidEmail(guest.email) ? 'Email inválido' : ''}
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="tel"
                                value={guest.phone || ''}
                                onChange={(e) => handleUpdateImportedGuest(guest.id, 'phone', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="1"
                                value={guest.adults || 1}
                                onChange={(e) => handleUpdateImportedGuest(guest.id, 'adults', parseInt(e.target.value) || 1)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-black text-sm text-center"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <input
                                type="number"
                                min="0"
                                value={guest.children || 0}
                                onChange={(e) => handleUpdateImportedGuest(guest.id, 'children', parseInt(e.target.value) || 0)}
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-black text-sm text-center"
                              />
                            </td>
                            <td className="px-2 py-2">
                              <select
                                value={guest.groupName || ''}
                                onChange={(e) => handleUpdateImportedGuest(guest.id, 'groupName', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-black text-sm bg-white"
                              >
                                <option value="">Sem grupo</option>
                                {groups.map((g) => (
                                  <option key={g._id} value={g.name}>{g.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-2 py-2">
                              <button
                                onClick={() => handleRemoveImportedGuest(guest.id)}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                                title="Remover"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      Total: <strong>{importedGuests.length}</strong> convidado(s)
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setImportStep(1)}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                      >
                        Voltar
                      </button>
                      <button
                        onClick={handleConfirmImport}
                        disabled={isProcessing || importedGuests.length === 0}
                        className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm disabled:opacity-50"
                      >
                        {isProcessing ? 'A importar...' : `Importar ${importedGuests.length} convidado(s)`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {/* Import Result Modal */}
        {showImportResultModal && importResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50">
            <div className="bg-white rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Resultado da Importação</h3>
              
              <div className="space-y-3 mb-6">
                {/* Success Count */}
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-emerald-600" />
                    <span className="text-gray-700">Importados com sucesso</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-lg">{importResult.successCount}</span>
                </div>
                
                {/* Duplicate Count */}
                {importResult.duplicateCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-amber-600" />
                      <span className="text-gray-700">Duplicados (já existem)</span>
                    </div>
                    <span className="font-bold text-amber-600 text-lg">{importResult.duplicateCount}</span>
                  </div>
                )}
                
                {/* Error Count */}
                {importResult.errorCount > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-gray-700">Erros</span>
                    </div>
                    <span className="font-bold text-red-600 text-lg">{importResult.errorCount}</span>
                  </div>
                )}
              </div>

              {/* Show details if there are errors or duplicates */}
              {(importResult.errors.length > 0 || importResult.duplicates.length > 0) && (
                <div className="mb-4 max-h-40 overflow-y-auto">
                  {importResult.duplicates.length > 0 && (
                    <div className="mb-2">
                      <p className="text-sm font-medium text-amber-700 mb-1">Duplicados:</p>
                      {importResult.duplicates.slice(0, 5).map((d, idx) => (
                        <p key={idx} className="text-xs text-amber-600">• {d.name} - {d.error}</p>
                      ))}
                      {importResult.duplicates.length > 5 && (
                        <p className="text-xs text-amber-600">...e mais {importResult.duplicates.length - 5}</p>
                      )}
                    </div>
                  )}
                  {importResult.errors.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-red-700 mb-1">Erros:</p>
                      {importResult.errors.slice(0, 5).map((e, idx) => (
                        <p key={idx} className="text-xs text-red-600">• {e.name} - {e.error}</p>
                      ))}
                      {importResult.errors.length > 5 && (
                        <p className="text-xs text-red-600">...e mais {importResult.errors.length - 5}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={() => {
                  setShowImportResultModal(false);
                  setImportResult(null);
                }}
                className="w-full px-4 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 font-medium"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bg-primary-500 {
          background-color: #5a7a5a;
        }
        .hover\:bg-primary-600:hover {
          background-color: #4a6a4a;
        }
        .text-primary-500 {
          color: #5a7a5a;
        }
        .text-primary-600 {
          color: #4a6a4a;
        }
        .border-primary-500 {
          border-color: #5a7a5a;
        }
        .ring-primary-500 {
          --tw-ring-color: #5a7a5a;
        }
        .focus\:ring-primary-500:focus {
          --tw-ring-color: #5a7a5a;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.2s ease-out;
        }
      `}</style>
    </DefaultLayout>
  );
}