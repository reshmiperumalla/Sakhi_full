import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Button } from '../../components/ui/Button';
import { BookOpen, CheckCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export function LearnPage() {
  const { t } = useLanguage();
  const [expandedId, setExpandedId] = useState('what_is_budget');

  const lessons = t('learn.lessons') || [];

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fadeIn pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#263238] tracking-tight flex items-center gap-2">
          <span>📚</span> {t('learn.title')}
        </h1>
        <p className="text-sm text-[#667085] mt-1">
          {t('learn.subtitle')}
        </p>
      </div>

      {/* Lesson Cards List */}
      <div className="space-y-4">
        {lessons.map((lesson) => {
          const isExpanded = expandedId === lesson.id;

          return (
            <div
              key={lesson.id}
              className="bg-white rounded-3xl border border-[#E3E7E4] shadow-subtle overflow-hidden transition hover:shadow-card"
            >
              {/* Collapsible Header */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : lesson.id)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-3 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <span className="text-2xl sm:text-3xl shrink-0 p-2 rounded-2xl bg-[#F7F8F5] border border-[#E3E7E4]">
                    {lesson.icon}
                  </span>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-[#263238]">
                      {lesson.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#667085] mt-0.5 line-clamp-1">
                      {lesson.summary}
                    </p>
                  </div>
                </div>

                <div className="p-1.5 rounded-xl bg-[#F7F8F5] text-[#667085]">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </button>

              {/* Expanded Lesson Content */}
              {isExpanded && (
                <div className="px-5 sm:px-6 pb-6 pt-1 border-t border-[#F0F2EE] space-y-4 animate-fadeIn">
                  <p className="text-sm text-[#374151] leading-relaxed">
                    {lesson.content}
                  </p>

                  {/* Key Rule Box */}
                  <div className="p-4 rounded-2xl bg-[#F0F7F4] border border-[#C2DFD4] border-l-4 border-l-[#176B5B] flex items-start gap-2.5 text-xs sm:text-sm text-[#176B5B] font-semibold">
                    <CheckCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#176B5B]" />
                    <span>{lesson.key_rule}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
