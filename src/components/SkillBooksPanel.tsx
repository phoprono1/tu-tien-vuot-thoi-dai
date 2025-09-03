import { useEffect, useState, useCallback } from "react";
import {
  Book,
  Flame,
  Snowflake,
  Droplet,
  Zap,
  Sword,
  Star,
  User,
  Clock,
} from "lucide-react";
import { DatabaseCharacter } from "@/types/database";
import { SkillBook, LearnedSkill } from "@/types/combat";
import { canLearnSkillBook } from "@/utils/combatCalculations";
import { useAPICache } from "@/hooks/useOptimization";

interface SkillBooksPanelProps {
  character: DatabaseCharacter;
  onSkillLearned?: () => void;
}

// Element icons mapping
const ELEMENT_ICONS = {
  fire: Flame,
  ice: Snowflake,
  poison: Droplet,
  lightning: Zap,
  physical: Sword,
};

// Rarity colors
const RARITY_COLORS = {
  common: "text-gray-400 bg-gray-700",
  uncommon: "text-green-400 bg-green-900",
  rare: "text-blue-400 bg-blue-900",
  epic: "text-purple-400 bg-purple-900",
  legendary: "text-yellow-400 bg-yellow-900",
  immortal: "text-red-400 bg-red-900",
};

export default function SkillBooksPanel({
  character,
  onSkillLearned,
}: SkillBooksPanelProps) {
  const [skillBooks, setSkillBooks] = useState<SkillBook[]>([]);
  const [learnedSkills, setLearnedSkills] = useState<LearnedSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [learningSkill, setLearningSkill] = useState<string | null>(null);

  useEffect(() => {
    loadSkillBooks();
    loadLearnedSkills();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character.$id]);

  // Cache skill books data (rarely changes)
  const skillBooksFetcher = useCallback(async () => {
    const response = await fetch("/api/skill-books");
    if (!response.ok) {
      throw new Error("Failed to load skill books");
    }
    return response.json();
  }, []);

  const { getCachedData: getCachedSkillBooks } = useAPICache(
    "skill-books",
    skillBooksFetcher,
    { cacheTime: 300000 } // 5 minutes cache (skill books rarely change)
  );

  // Cache learned skills data
  const learnedSkillsFetcher = useCallback(async () => {
    const response = await fetch(
      `/api/learned-skills?characterId=${character.$id}`
    );
    if (!response.ok) {
      throw new Error("Failed to load learned skills");
    }
    return response.json();
  }, [character.$id]);

  const {
    getCachedData: getCachedLearnedSkills,
    forceRefresh: refreshLearnedSkills,
  } = useAPICache(
    `learned-skills-${character.$id}`,
    learnedSkillsFetcher,
    { cacheTime: 30000 } // 30 seconds cache
  );

  const loadSkillBooks = async () => {
    try {
      const books = await getCachedSkillBooks();
      setSkillBooks(books);
    } catch (error) {
      console.error("Error loading skill books:", error);
    }
  };

  const loadLearnedSkills = async () => {
    try {
      const skills = await getCachedLearnedSkills();
      setLearnedSkills(skills);
    } catch (error) {
      console.error("Error loading learned skills:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLearnSkill = async (skillBook: SkillBook) => {
    const { canLearn, reason } = canLearnSkillBook(character, skillBook);

    if (!canLearn) {
      alert(reason);
      return;
    }

    // Check if already learned
    const alreadyLearned = learnedSkills.some(
      (skill) => skill.skillBookId === skillBook.$id
    );
    if (alreadyLearned) {
      alert("Bạn đã học skill này rồi!");
      return;
    }

    setLearningSkill(skillBook.$id);

    try {
      // Learn the skill
      const response = await fetch("/api/learned-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          characterId: character.$id,
          skillBookId: skillBook.$id,
          element: skillBook.element,
          name: skillBook.name,
          level: 1, // Initial level when learning
          experience: 0, // Initial experience
          learnedAt: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        // Deduct stamina from character
        const staminaCost = getStaminaCost(skillBook.rarity);
        await fetch(`/api/characters/${character.$id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stamina: character.stamina - staminaCost,
          }),
        });

        // Force refresh learned skills using cache invalidation
        try {
          const refreshedSkills = await refreshLearnedSkills();
          setLearnedSkills(refreshedSkills);
        } catch (error) {
          console.error("Error refreshing learned skills:", error);
        }

        onSkillLearned?.();
        alert(`Đã học thành công skill "${skillBook.name}"!`);
      } else {
        alert("Có lỗi xảy ra khi học skill");
      }
    } catch (error) {
      console.error("Error learning skill:", error);
      alert("Có lỗi xảy ra khi học skill");
    } finally {
      setLearningSkill(null);
    }
  };

  const getStaminaCost = (rarity: string): number => {
    const costs = {
      common: 10,
      uncommon: 50,
      rare: 100,
      epic: 200,
      legendary: 350,
      immortal: 500,
    };
    return costs[rarity as keyof typeof costs] || 10;
  };

  const isSkillLearned = (skillBookId: string): LearnedSkill | undefined => {
    return learnedSkills.find((skill) => skill.skillBookId === skillBookId);
  };

  const getElementIcon = (element: string) => {
    const IconComponent =
      ELEMENT_ICONS[element as keyof typeof ELEMENT_ICONS] || Book;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Book className="w-5 h-5 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Skill Books</h2>
        </div>
        <div className="text-sm text-gray-400">
          Đã học: {learnedSkills.length} skills
        </div>
      </div>

      {/* Learned Skills Summary */}
      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-400" />
          Skills Đã Học
        </h3>
        {learnedSkills.length === 0 ? (
          <p className="text-gray-400 text-sm">Chưa học skill nào</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {learnedSkills.map((skill) => (
              <div
                key={skill.$id}
                className="px-3 py-1 bg-green-600 rounded-full text-sm text-white flex items-center gap-2"
              >
                {getElementIcon(skill.element)}
                {skill.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Skill Books */}
      <div>
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Book className="w-4 h-4 text-purple-400" />
          Skill Books Có Sẵn
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {skillBooks.map((book) => {
            const learned = isSkillLearned(book.$id);
            const { canLearn, reason } = canLearnSkillBook(character, book);
            const staminaCost = getStaminaCost(book.rarity);
            const rarityClass =
              RARITY_COLORS[book.rarity as keyof typeof RARITY_COLORS] ||
              "text-gray-400 bg-gray-700";

            return (
              <div
                key={book.$id}
                className={`p-4 rounded-lg border-2 ${
                  learned
                    ? "bg-green-900 border-green-600"
                    : canLearn
                    ? "bg-gray-700 border-gray-600 hover:border-gray-500"
                    : "bg-gray-800 border-gray-700 opacity-60"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getElementIcon(book.element)}
                      <h4 className="text-white font-bold">{book.name}</h4>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${rarityClass}`}
                      >
                        {book.rarity.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">
                      {book.description}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <User className="w-4 h-4" />
                        Element: {book.element}
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Clock className="w-4 h-4" />
                        Cost: {staminaCost} stamina
                      </div>
                    </div>
                  </div>

                  <div className="ml-4">
                    {learned ? (
                      <div className="px-4 py-2 bg-green-600 rounded-lg text-white text-sm font-bold text-center">
                        <div>✓ Đã Học</div>
                        <div className="text-xs text-green-200">
                          Level {learned.level || 1}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleLearnSkill(book)}
                        disabled={!canLearn || learningSkill === book.$id}
                        className={`px-4 py-2 rounded-lg text-sm font-bold ${
                          canLearn
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-gray-600 text-gray-400 cursor-not-allowed"
                        }`}
                        title={!canLearn ? reason : "Click để học skill này"}
                      >
                        {learningSkill === book.$id
                          ? "Đang học..."
                          : "Học Skill"}
                      </button>
                    )}
                  </div>
                </div>

                {!canLearn && !learned && (
                  <div className="mt-2 text-red-400 text-xs">{reason}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
