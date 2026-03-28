"use client";

import { useEffect, useEffectEvent, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import { HelpCircle, ImageIcon, LayoutDashboard, Map, Newspaper, Plus, Users } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    Boolean(target.closest("[contenteditable='true']"))
  );
}

const commands = [
  { label: "Dashboard", href: "/CMS/home", shortcut: "g h", icon: LayoutDashboard, ownerOnly: false },
  { label: "Entries", href: "/CMS/entries", shortcut: "g e", icon: Newspaper, ownerOnly: false },
  { label: "Regions", href: "/CMS/regions", shortcut: "g r", icon: Map, ownerOnly: false },
  { label: "Media", href: "/CMS/media", shortcut: "g m", icon: ImageIcon, ownerOnly: false },
  { label: "Users", href: "/CMS/users", shortcut: "g u", icon: Users, ownerOnly: true },
  { label: "New Entry", href: "/CMS/entries/new", shortcut: "n", icon: Plus, ownerOnly: false },
] as const;

export function CmsHotkeys({ canManageUsers }: { canManageUsers: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [leaderPending, setLeaderPending] = useState(false);
  const visibleCommands = commands.filter((command) => !command.ownerOnly || canManageUsers);

  const runSequence = useEffectEvent((key: string) => {
    if (!leaderPending) {
      return;
    }

    setLeaderPending(false);

    if (key === "h") {
      router.push("/CMS/home");
    }

    if (key === "e") {
      router.push("/CMS/entries");
    }

    if (key === "r") {
      router.push("/CMS/regions");
    }

    if (key === "m") {
      router.push("/CMS/media");
    }

    if (key === "u" && canManageUsers) {
      router.push("/CMS/users");
    }
  });

  useHotkeys("meta+k,ctrl+k", (event) => {
    event.preventDefault();
    setCommandOpen((value) => !value);
  });

  useHotkeys("?", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    event.preventDefault();
    setHelpOpen((value) => !value);
  });

  useHotkeys("/", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    event.preventDefault();
    const element = document.querySelector<HTMLElement>("[data-cms-search='true']");
    element?.focus();
  });

  useHotkeys("n", (event) => {
    if (isEditableTarget(event.target)) {
      return;
    }

    event.preventDefault();
    router.push("/CMS/entries/new");
  });

  useHotkeys("meta+s,ctrl+s", (event) => {
    if (isEditableTarget(event.target)) {
      event.preventDefault();
    }

    event.preventDefault();
    const button = document.querySelector<HTMLElement>("[data-cms-save='true']");
    button?.click();
  });

  useHotkeys("esc", () => {
    setCommandOpen(false);
    setHelpOpen(false);
    const closer = document.querySelector<HTMLElement>("[data-cms-close='true']");
    closer?.click();
  });

  useEffect(() => {
    const controller = new AbortController();
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }

      if (event.key === "g") {
        setLeaderPending(true);
        timeoutId = setTimeout(() => setLeaderPending(false), 800);
        return;
      }

      if (leaderPending) {
        runSequence(event.key.toLowerCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown, { signal: controller.signal });

    return () => {
      controller.abort();
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [canManageUsers, leaderPending]);

  return (
    <>
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Search CMS commands..." />
        <CommandList>
          <CommandEmpty>No command found.</CommandEmpty>
          <CommandGroup heading="Navigate">
            {visibleCommands.map((command) => {
              const Icon = command.icon;
              return (
                <CommandItem
                  key={command.href}
                  onSelect={() => {
                    setCommandOpen(false);
                    router.push(command.href);
                  }}
                >
                  <Icon className="size-4" />
                  <span>{command.label}</span>
                  <CommandShortcut>{command.shortcut}</CommandShortcut>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="cms-surface max-w-xl border-0 p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="size-4 text-primary" />
              CMS Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Navigation stays disabled inside text fields and textareas.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            {[
              ["?", "Open help"],
              ["Ctrl/Cmd + K", "Open command palette"],
              ["/", "Focus search"],
              [
                canManageUsers ? "g h / g e / g r / g m / g u" : "g h / g e / g r / g m",
                canManageUsers
                  ? "Jump between dashboard, entries, regions, media, and users"
                  : "Jump between dashboard, entries, regions, and media",
              ],
              ["n", "Create a new entry"],
              ["Ctrl/Cmd + S", "Save current editor"],
              ["Esc", "Close overlays"],
            ].map(([shortcut, description]) => (
              <div
                key={shortcut}
                className="cms-surface-subtle flex items-center justify-between gap-4 rounded-2xl px-4 py-3"
              >
                <span className="font-mono text-xs text-primary">{shortcut}</span>
                <span className="text-sm text-muted-foreground">{description}</span>
              </div>
            ))}
          </div>
          <div className="cms-surface-subtle rounded-2xl px-4 py-3 text-xs text-muted-foreground">
            Current route: <span className="font-mono text-foreground">{pathname}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
