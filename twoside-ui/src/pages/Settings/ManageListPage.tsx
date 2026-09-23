// import { useState } from "react";
// import { useParams, Link } from "react-router-dom";

// import { Switch } from "./components/Switch";
// import { ArrowLeft, Pencil, Trash2, Plus, Check, X } from "lucide-react";

// import { useUserStore } from "@/stores/useUserStore";
// import { ApiError } from "@/api/client";

// type ListType = "accounts" | "categories" | "counterparties";

// WE NEED A GUARD!
// IF THERE IS NO LIST TYPE
// THEN WE HAVE TO TAKE EM TO THE SETTINGS
// 
// I WANT TO DO SOMETHING TOO
// A PROPER loading icon until the info loads too
// Or I have the 
// 
// I also want a redordering, active ones at the top, inactive at the bottom
// Yeah just overall, have a better quality of life and usage.
// 
// also the validations that can be made here should be made
// 
// INfo now has to return everything and it's users must sort it
// or I'll give them helpers

// const TITLES: Record<ListType, string> = {
//   accounts: "Accounts",
//   categories: "Categories",
//   counterparties: "Counterparties",
// };

// const ADD_PLACEHOLDERS: Record<ListType, string> = {
//   accounts: "e.g. Second Bank Account",
//   categories: "e.g. Transport",
//   counterparties: "e.g. John",
// };

export function ManageListPage() {
  // const { type } = useParams<{ type: ListType }>();
  // const list_type = (type ?? "accounts") as ListType;

  // const data = useUserStore((state) => state.data);
  // const items = (() => {
  //   if (!data) return [];
  //   switch (list_type) {
  //     case 'accounts': return data.accounts;
  //     case 'categories': return data.categories;
  //     case 'counterparties': return data.counterparties;
  //   }
  // })();   

  // const createCategory = useUserStore((state) => state.createCategory);
  // const editCategory = useUserStore((state) => state.editCategory);

  // const createCounterparty = useUserStore((state) => state.createCounterparty);
  // const editCounterparty = useUserStore((state) => state.editCounterparty);

  // const [error_message, setErrorMessage] = useState<string | null>(null);
  // const [editing_id, setEditingId] = useState<string | null>(null);
  // const [edit_value, setEditValue] = useState("");
  // const [new_name, setNewName] = useState("");
  // const [adding, setAdding] = useState(false);
  // const [active_map, setActiveMap] = useState<Record<string, boolean>>({});

  // // const isActive = (id: string) => active_map[id] ?? true;

  // const isActive = (id: number) => items[id].is_active ?? true;

  // const handleToggleActive = async (id: string) => {
  //   // TODO: wire to real deactivate/reactivate endpoint once it exists
  //   setActiveMap((prev) => ({ ...prev, [id]: !isActive(id) }));
  // };

  // const startEditing = (id: string, current_name: string) => {
  //   setEditingId(id);
  //   setEditValue(current_name);
  // };

  // const cancelEditing = () => {
  //   setEditingId(null);
  //   setEditValue("");
  // };

  // const saveEditing = async () => {
  //   if (!editing_id) return;
  
  //   try {
  //     if (list_type === "categories") {
  //       await editCategory(editing_id, edit_value.trim(), isActive(editing_id));
  //     } else if (list_type === 'counterparties') {
  //     	await editCounterparty(editing_id, edit_value.trim(), isActive(editing_id));
  //     }
  //     cancelEditing();
  //   } catch (error) {
  //     setErrorMessage(ApiError.getErrorMessage(error));
  //   }
  // };

  // const handleDelete = async (_id: string) => {
  //   // TODO: wire to real delete endpoint once it exists — backend rejects
  //   // if the item has been used, surface that as an error toast here.
  // };

  // const handleAdd = async (e: React.SubmitEvent) => {
  //   e.preventDefault();
  //   if (!new_name.trim()) return;
  //   setAdding(true);
  //   setErrorMessage(null);

  //   try {
  //     if (list_type === "categories") {
  //       await createCategory(new_name.trim());
  //     } else if (list_type === "counterparties") {
  //       await createCounterparty(new_name.trim());
  //     }
  //     // TODO: accounts / counterparties once those endpoints exist
  //     setNewName("");
  //   } catch (error) {
  //   	setErrorMessage(ApiError.getErrorMessage(error));
  //   } finally {
  //     setAdding(false);
  //   }
  // };

  // return (
  //   <div className="min-h-screen bg-background px-4 pt-6 pb-28 app-container">
  //     <div className="flex items-center gap-3 mb-6">
  //       <Link to="/settings" className="text-muted hover:text-foreground transition-colors">
  //         <ArrowLeft className="w-5 h-5" />
  //       </Link>
  //       <h1 className="text-lg font-bold text-foreground">{TITLES[list_type]}</h1>
  //     </div>

  //     <div className="bg-surface border border-border rounded-2xl divide-y divide-border mb-4">
  //       {items.map((item) => (
  //         <div key={item.id} className="flex items-center gap-3 px-4 py-3">
  //           {editing_id === item.id ? (
  //             <>
  //               <input
  //                 autoFocus
  //                 value={edit_value}
  //                 onChange={(e) => setEditValue(e.target.value)}
  //                 className="flex-1 bg-transparent border-none text-xs text-foreground focus:ring-0 focus:outline-none"
  //               />
  //               <button
  //                 type="button"
  //                 onClick={saveEditing}
  //                 className="text-primary hover:text-primary-hover cursor-pointer"
  //               >
  //                 <Check className="w-4 h-4" />
  //               </button>
  //               <button
  //                 type="button"
  //                 onClick={cancelEditing}
  //                 className="text-muted hover:text-foreground cursor-pointer"
  //               >
  //                 <X className="w-4 h-4" />
  //               </button>
  //             </>
  //           ) : (
  //             <>
  //               <span
  //                 className={`flex-1 text-xs font-medium truncate ${
  //                   isActive(item.id) ? "text-foreground" : "text-muted"
  //                 }`}
  //               >
  //                 {item.name}
  //               </span>
  //               <button
  //                 type="button"
  //                 onClick={() => startEditing(item.id, item.name)}
  //                 className="text-muted hover:text-foreground cursor-pointer"
  //               >
  //                 <Pencil className="w-3.5 h-3.5" />
  //               </button>
  //               <button
  //                 type="button"
  //                 onClick={() => handleDelete(item.id)}
  //                 className="text-muted hover:text-red-400 cursor-pointer"
  //               >
  //                 <Trash2 className="w-3.5 h-3.5" />
  //               </button>
  //               <Switch checked={isActive(item.id)} onChange={() => handleToggleActive(item.id)} />
  //             </>
  //           )}
  //         </div>
  //       ))}

  //       {items.length === 0 && (
  //         <p className="text-xs text-muted text-center py-6">Nothing here yet.</p>
  //       )}
  //     </div>

  //     <form onSubmit={handleAdd} className="flex gap-2">
  //       <input
  //         value={new_name}
  //         onChange={(e) => setNewName(e.target.value)}
  //         placeholder={ADD_PLACEHOLDERS[list_type]}
  //         className="flex-1 bg-surface border border-border rounded-2xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/70 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/50"
  //       />
  //       <button
  //         type="submit"
  //         disabled={adding || !new_name.trim()}
  //         className="w-11 h-11 shrink-0 bg-primary hover:bg-primary-hover active:scale-95 rounded-2xl flex items-center justify-center text-white transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
  //       >
  //         <Plus className="w-5 h-5" />
  //       </button>
  //     </form>
  //   </div>
  // );
}