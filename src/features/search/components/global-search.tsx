"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { searchAction } from "@/features/search/actions";
import type { SearchResult } from "@/infrastructure/repositories/search-repository";

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fires the debounced search once the query is long enough. Short-query
  // resets happen immediately in handleQueryChange (an event handler, not
  // this effect), so this effect never calls setState synchronously —
  // only inside the timeout/promise callbacks.
  useEffect(() => {
    if (query.trim().length < 2) return;
    const timeout = setTimeout(() => {
      searchAction(query)
        .then(setResults)
        .finally(() => setIsSearching(false));
    }, 200);
    return () => clearTimeout(timeout);
  }, [query]);

  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
    } else {
      setIsSearching(true);
    }
  }

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, result) => {
    (acc[result.type] ??= []).push(result);
    return acc;
  }, {});

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="size-4" />
        Search
        <kbd className="ml-2 hidden rounded border px-1.5 text-[10px] sm:inline">⌘K</kbd>
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search"
        description="Search everything"
      >
        <CommandInput
          placeholder="Search subjects, assignments, exams…"
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList>
          {query.trim().length >= 2 && !isSearching && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {Object.entries(grouped).map(([type, items]) => (
            <CommandGroup key={type} heading={`${type}s`}>
              {items.map((item) => (
                <CommandItem
                  key={`${item.type}-${item.id}`}
                  value={`${item.type}-${item.id}`}
                  onSelect={() => {
                    setOpen(false);
                    router.push(item.href);
                  }}
                >
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-muted-foreground text-xs">{item.subtitle}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
