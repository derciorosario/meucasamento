import { useState, useEffect } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import { Edit2, Trash2, X, MoreVertical, Filter, ChevronDown, Users, Check, Clock, AlertCircle, Plus, Search, Mail } from 'lucide-react';
import {
  getGuests,
  getGuestStats,
  createGuest,
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
  sendBulkInvitations,
  sendInvitationEmails,
} from "../../api/client";
import { toast } from "react-hot-toast";

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

export default function GuestsPage() {
  const [activeTab, setActiveTab] = useState("Lista Geral");
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
  const [activeMobileTab, setActiveMobileTab] = useState("lista");

  // Modal states
  const [showGuestModal, setShowGuestModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showTableModal, setShowTableModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingGuest, setEditingGuest] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingTable, setEditingTable] = useState(null);
  const [editingMenu, setEditingMenu] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [selectedGuests, setSelectedGuests] = useState([]);
  const [sendingInvites, setSendingInvites] = useState(false);
  const [showInviteConfirm, setShowInviteConfirm] = useState(false);

  // Form states
  const [guestForm, setGuestForm] = useState({
    name: "",
    email: "",
    phone: "",
    group: "",
    table: "",
    menu: "",
    adults: null,
    children: null,
    babies: null,
    status: "pending",
  });

  const [groupForm, setGroupForm] = useState({
    name: "",
    color: "bg-orange-400",
    description: "",
  });

  const [tableForm, setTableForm] = useState({
    name: "",
    capacity: null,
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
    }
  }, [activeTab, search, statusFilter, groupFilter]);

  const initializeAndLoadData = async () => {
    try {
      setLoading(true);
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
        adults: guestForm.adults ?? 0,
        children: guestForm.children ?? 0,
        babies: guestForm.babies ?? 0,
        status: guestForm.status,
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
      babies: guest.babies ?? 0,
      status: guest.status || "pending",
    });
    setShowGuestModal(true);
    setMobileActionMenu(null);
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
      adults: null,
      children: null,
      babies: null,
      status: "pending",
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
        capacity: tableForm.capacity ?? 0,
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
      capacity: table.capacity ?? null,
    });
    setShowTableModal(true);
    setMobileActionMenu(null);
  };

  const handleDeleteTable = async (id) => {
    setDeleteConfirm(id);
    setDeleteType('table');
    setMobileActionMenu(null);
  };

  const resetTableForm = () => {
    setEditingTable(null);
    setTableForm({ name: "", capacity: null });
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
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  const resetMenuForm = () => {
    setEditingMenu(null);
    setMenuForm({ name: "", description: "", isAdult: true, price: 0 });
  };

  const handleSendInvites = async () => {
    const pendingGuests = guests.filter((g) => g.status === "pending");
    if (pendingGuests.length === 0) {
      toast.error("Nenhum convidado pendente para enviar convite");
      return;
    }

    try {
      await sendBulkInvitations(pendingGuests.map((g) => g._id));
      toast.success("Convites enviados com sucesso");
      await loadGuests();
    } catch (error) {
      console.error("Error sending invitations:", error);
      toast.error("Erro ao enviar convites");
    }
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
      const response = await sendInvitationEmails(guestIds);
      toast.success(`${response.data.sentCount} convite(s) enviado(s) com sucesso!`);
      if (response.data.withoutEmail > 0) {
        toast.error(`${response.data.withoutEmail} convidado(s) sem email`);
      }
      await loadGuests();
      setSelectedGuests([]);
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
      <DefaultLayout hero={{title:"Convidados",subtitle:"Gerencie sua lista de convidados e acompanhe as confirmações"}}>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout hero={{title:"Convidados",subtitle:"Gerencie sua lista de convidados e acompanhe as confirmações"}}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          {/* Mobile Header with Add Button */}
          <div className="lg:hidden flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-900">Meus Convidados</h1>
            <button
              onClick={() => {
                resetGuestForm();
                setShowGuestModal(true);
              }}
              className="bg-primary-500 text-white p-3 rounded-full shadow-lg hover:bg-primary-600 transition-colors"
              aria-label="Adicionar convidado"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Title Row */}
          <div className="hidden lg:flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Meus Convidados</h1>
            </div>
            <button
              onClick={() => {
                resetGuestForm();
                setShowGuestModal(true);
              }}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition flex items-center space-x-2"
            >
              <span className="text-lg leading-none">+</span>
              <span>Adicionar Convidado</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left Column */}
            <div className="lg:col-span-2">
              {/* Stats Cards - Mobile Scrollable */}
              <div className="lg:hidden mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-3 min-w-max">
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-36">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Total</p>
                      <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                        <Users className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-36">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Confirmados</p>
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-emerald-600">{stats.confirmed}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-36">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Pendentes</p>
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Clock className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-amber-600">{stats.pending}</p>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 w-36">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Recusaram</p>
                      <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <p className="text-xl font-bold text-red-600">{stats.declined}</p>
                  </div>
                </div>
              </div>

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

              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="w-full flex items-center justify-between p-3 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Filtros</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Filters */}
              <div className={`${showMobileFilters ? 'block' : 'hidden lg:flex'} flex-col lg:flex-row items-start lg:items-center gap-3 mb-6`}>
                <div className="relative flex-1 max-w-xs w-full lg:w-auto">
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
                  className="w-full lg:w-auto border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
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
                  className="w-full lg:w-auto border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-700"
                >
                  <option value="all">Todos os status</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="pending">Pendente</option>
                  <option value="declined">Recusou</option>
                </select>
                <div className="lg:ml-auto w-full lg:w-auto flex gap-2">
                  <button
                    onClick={() => setShowInviteConfirm(true)}
                    disabled={sendingInvites}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-1.5 bg-green-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
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
                    }}
                    className="w-full lg:w-auto flex items-center justify-center gap-1.5 bg-primary-500 text-white text-sm px-4 py-2.5 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Novo Grupo</span>
                  </button>
                </div>
              </div>

              {/* Mobile Tabs */}
              <div className="lg:hidden mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                <div className="flex gap-2 min-w-max">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
                        activeTab === tab 
                          ? "bg-primary-500 text-white shadow-md" 
                          : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Tabs */}
              <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
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

              {/* Tab Content - Always visible (not wrapped in lg:hidden) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="p-4">
                  {/* Lista Geral Tab */}
                  {activeTab === "Lista Geral" && (
                    <div className="divide-y divide-gray-50">
                      {filteredGuests.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          Nenhum convidado encontrado. Adicione seu primeiro convidado!
                        </div>
                      ) : (
                        <>
                          {/* Desktop View */}
                          <div className="hidden lg:block">
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
                                  <div className="text-center">
                                    <p className="text-xs text-gray-400">Bebês</p>
                                    <p className="text-sm font-semibold text-gray-700">{guest.babies}</p>
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
                          </div>

                          {/* Mobile View */}
                          <div className="lg:hidden space-y-3">
                            {filteredGuests.map((guest) => (
                              <div
                                key={guest._id}
                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex items-start justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-10 h-10 rounded-full ${getGroupColor(
                                        guest.group?.color
                                      )} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}
                                    >
                                      {getInitials(guest.name)}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-900">{guest.name}</p>
                                      <p className="text-xs text-gray-500">
                                        {guest.group?.name || "Sem grupo"}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Mobile 3-dots Menu */}
                                  <div className="relative">
                                    <button
                                      onClick={() => setMobileActionMenu(mobileActionMenu === guest._id ? null : guest._id)}
                                      className="p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                                      aria-label="Opções"
                                    >
                                      <MoreVertical className="w-5 h-5" />
                                    </button>
                                    
                                    {mobileActionMenu === guest._id && (
                                      <>
                                        <div 
                                          className="fixed inset-0 z-40"
                                          onClick={() => setMobileActionMenu(null)}
                                        />
                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                                          <button
                                            onClick={() => handleEditGuest(guest)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100"
                                          >
                                            <Edit2 className="w-5 h-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700">Editar</span>
                                          </button>
                                          <button
                                            onClick={() => handleDeleteGuest(guest._id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                                          >
                                            <Trash2 className="w-5 h-5 text-red-600" />
                                            <span className="text-sm font-medium text-gray-700">Excluir</span>
                                          </button>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-3">
                                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-500">Adultos</p>
                                    <p className="text-lg font-semibold text-gray-900">{guest.adults}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-500">Crianças</p>
                                    <p className="text-lg font-semibold text-gray-900">{guest.children}</p>
                                  </div>
                                  <div className="bg-gray-50 rounded-lg p-2 text-center">
                                    <p className="text-xs text-gray-500">Bebês</p>
                                    <p className="text-lg font-semibold text-gray-900">{guest.babies}</p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between">
                                  <div className="flex-1 mr-3">
                                    <select
                                      value={guest.status}
                                      onChange={(e) => handleQuickStatusChange(guest._id, e.target.value)}
                                      className={`${getStatusColor(guest.status)} px-3 py-1.5 rounded-lg text-xs font-medium w-full text-center cursor-pointer appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500`}
                                    >
                                      <option value="pending">Pendente</option>
                                      <option value="confirmed">Confirmado</option>
                                      <option value="declined">Recusou</option>
                                    </select>
                                  </div>
                                  {guest.email && (
                                    <span className="text-xs text-gray-400 truncate max-w-[120px]">
                                      {guest.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Grupos Tab */}
                  {activeTab === "Grupos" && (
                    <div>
                      <div className="lg:hidden mb-4">
                        <button
                          onClick={() => {
                            resetGroupForm();
                            setShowGroupModal(true);
                          }}
                          className="w-full bg-primary-500 text-white px-4 py-3 rounded-lg text-sm hover:bg-primary-600 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Novo Grupo
                        </button>
                      </div>
                      <div className="hidden lg:flex justify-end mb-4">
                        <button
                          onClick={() => {
                            resetGroupForm();
                            setShowGroupModal(true);
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

                  {/* Mesas Tab */}
                  {activeTab === "Mesas" && (
                    <div>
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
                        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                          <div className="flex-1 lg:flex-none bg-primary-50 rounded-lg px-3 py-2 text-center">
                            <span className="text-xs text-gray-600 block">Total lugares</span>
                            <span className="font-semibold text-gray-900">{tables.reduce((acc, t) => acc + t.capacity, 0)}</span>
                          </div>
                          <div className="flex-1 lg:flex-none bg-emerald-50 rounded-lg px-3 py-2 text-center">
                            <span className="text-xs text-gray-600 block">Ocupados</span>
                            <span className="font-semibold text-emerald-600">{tables.reduce((acc, t) => acc + (t.guestCount || 0), 0)}</span>
                          </div>
                          <div className="flex-1 lg:flex-none bg-amber-50 rounded-lg px-3 py-2 text-center">
                            <span className="text-xs text-gray-600 block">Disponíveis</span>
                            <span className="font-semibold text-amber-600">{tables.reduce((acc, t) => acc + (t.availableSeats || 0), 0)}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            resetTableForm();
                            setShowTableModal(true);
                          }}
                          className="w-full lg:w-auto bg-primary-500 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-primary-600 flex items-center justify-center gap-2"
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

                  {/* Cardápios Tab */}
                  {activeTab === "Cardápios" && (
                    <div>
                      <div className="lg:hidden mb-4">
                        <button
                          onClick={() => {
                            resetMenuForm();
                            setShowMenuModal(true);
                          }}
                          className="w-full bg-primary-500 text-white px-4 py-3 rounded-lg text-sm hover:bg-primary-600 flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Novo Cardápio
                        </button>
                      </div>
                      <div className="hidden lg:flex justify-end mb-4">
                        <button
                          onClick={() => {
                            resetMenuForm();
                            setShowMenuModal(true);
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

                  {/* Presenças Tab */}
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

              {/* Tip */}
              <div className="flex items-start space-x-3 bg-green-50 border border-green-200 rounded-lg p-4">
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

            {/* Right Column - Smart Tips */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-8">
                <div className="flex items-center space-x-2 mb-6">
                  <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">💡</span>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Dicas inteligentes</h2>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      A média de confirmações é de <span className="font-semibold text-gray-900">60%</span> dos convidados
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      Considere reservar <span className="font-semibold text-gray-900">10%</span> a mais de lugares para imprevistos
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full mt-2"></div>
                    <p className="text-sm text-gray-700">
                      Famílias geralmente representam <span className="font-semibold text-gray-900">40%</span> dos convidados
                    </p>
                  </div>
                </div>

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
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total de bebês:</span>
                      <span className="font-semibold text-gray-900">{stats.totalBabies}</span>
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

        {/* Mobile FAB for adding items based on active tab */}
        <button
          onClick={() => {
            if (activeTab === "Lista Geral") {
              resetGuestForm();
              setShowGuestModal(true);
            } else if (activeTab === "Grupos") {
              resetGroupForm();
              setShowGroupModal(true);
            } else if (activeTab === "Mesas") {
              resetTableForm();
              setShowTableModal(true);
            } else if (activeTab === "Cardápios") {
              resetMenuForm();
              setShowMenuModal(true);
            }
          }}
          className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-primary-500 rounded-full shadow-lg flex items-center justify-center text-white hover:bg-primary-600 transition-colors z-40"
          aria-label="Adicionar"
        >
          <Plus className="w-6 h-6" />
        </button>

        {/* Guest Modal */}
        {showGuestModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4 top-0 bg-white">
                <h2 className="text-xl font-semibold text-black">
                  {editingGuest ? "Editar Convidado" : "Adicionar Convidado"}
                </h2>
                <button 
                  onClick={() => { setShowGuestModal(false); resetGuestForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestForm.email}
                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Telefone</label>
                  <input
                    type="tel"
                    value={guestForm.phone}
                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="+258"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Adultos</label>
                    <input
                      type="number"
                      min="0"
                      value={guestForm.adults ?? ''}
                      onChange={(e) => setGuestForm({ ...guestForm, adults: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Crianças</label>
                    <input
                      type="number"
                      min="0"
                      value={guestForm.children ?? ''}
                      onChange={(e) => setGuestForm({ ...guestForm, children: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Bebês</label>
                    <input
                      type="number"
                      min="0"
                      value={guestForm.babies ?? ''}
                      onChange={(e) => setGuestForm({ ...guestForm, babies: parseInt(e.target.value) || null })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">Grupo *</label>
                    <select
                      required
                      value={guestForm.group}
                      onChange={(e) => setGuestForm({ ...guestForm, group: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    >
                      <option value="">Selecione...</option>
                      {tables.map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Cardápio</label>
                  <select
                    value={guestForm.menu}
                    onChange={(e) => setGuestForm({ ...guestForm, menu: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="declined">Recusou</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGuestModal(false);
                      resetGuestForm();
                    }}
                    className="w-full sm:flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 order-1 sm:order-2"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingGroup ? "Editar Grupo" : "Novo Grupo"}
                </h2>
                <button 
                  onClick={() => { setShowGroupModal(false); resetGroupForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Nome do grupo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cor</label>
                  <div className="flex gap-2 flex-wrap">
                    {groupColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setGroupForm({ ...groupForm, color })}
                        className={`w-8 h-8 rounded-full ${color} ${
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    rows={2}
                    placeholder="Descrição opcional"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupModal(false);
                      resetGroupForm();
                    }}
                    className="w-full sm:flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 order-1 sm:order-2"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingTable ? "Editar Mesa" : "Nova Mesa"}
                </h2>
                <button 
                  onClick={() => { setShowTableModal(false); resetTableForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Ex: Mesa 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Capacidade</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={tableForm.capacity ?? ''}
                    onChange={(e) => setTableForm({ ...tableForm, capacity: parseInt(e.target.value) || null })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="0"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTableModal(false);
                      resetTableForm();
                    }}
                    className="w-full sm:flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 order-1 sm:order-2"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-black">
                  {editingMenu ? "Editar Cardápio" : "Novo Cardápio"}
                </h2>
                <button 
                  onClick={() => { setShowMenuModal(false); resetMenuForm(); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
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
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    placeholder="Nome do cardápio"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Descrição</label>
                  <textarea
                    value={menuForm.description}
                    onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                    rows={2}
                    placeholder="Descrição do menu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">Tipo</label>
                  <select
                    value={menuForm.isAdult ? "adult" : "child"}
                    onChange={(e) => setMenuForm({ ...menuForm, isAdult: e.target.value === "adult" })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-black"
                  >
                    <option value="adult">Adulto</option>
                    <option value="child">Criança</option>
                  </select>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenuModal(false);
                      resetMenuForm();
                    }}
                    className="w-full sm:flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 order-2 sm:order-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-4 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 order-1 sm:order-2"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-end mb-2">
                <button 
                  onClick={() => { setDeleteConfirm(null); setDeleteType(null); }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
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
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => {
                    setDeleteConfirm(null);
                    setDeleteType(null);
                  }}
                  className="w-full sm:flex-1 text-gray-500 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium order-1 sm:order-2"
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Send Invitation Confirmation Modal */}
        {showInviteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4">
              <div className="flex items-center justify-end mb-2">
                <button 
                  onClick={() => setShowInviteConfirm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-green-100 rounded-full mb-4">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Enviar Convites</h3>
              <p className="text-gray-600 text-center mb-6">
                {selectedGuests.length > 0 
                  ? `Tem certeza que deseja enviar convites para ${selectedGuests.length} convidado(s) selecionado(s)?`
                  : "Tem certeza que deseja enviar convites para todos os convidados com email?"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowInviteConfirm(false)}
                  className="w-full sm:flex-1 text-gray-500 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSendInvitationEmails}
                  disabled={sendingInvites}
                  className="w-full sm:flex-1 px-4 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium order-1 sm:order-2 disabled:opacity-50"
                >
                  {sendingInvites ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
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
      `}</style>
    </DefaultLayout>
  );
}
