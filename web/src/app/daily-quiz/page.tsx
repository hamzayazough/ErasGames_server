'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth.context';
import { adminDailyQuizService } from '@/lib/services/admin-daily-quiz.service';
import type { DailyQuiz, QuestionAvailability, JobStatus } from '@/lib/types/api.types';
import QuizScheduleCard from '@/components/daily-quiz/QuizScheduleCard';
import QuizDetailsModal from '@/components/daily-quiz/QuizDetailsModal';
import CreateQuizModal from '@/components/daily-quiz/CreateQuizModal';
import EditQuizModal from '@/components/daily-quiz/EditQuizModal';

interface QuizScheduleItem {
  day: number;
  label: string;
  date: Date;
  quiz: DailyQuiz | null;
  loading: boolean;
}

export default function DailyQuizPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [quizSchedule, setQuizSchedule] = useState<QuizScheduleItem[]>([]);
  const [availability, setAvailability] = useState<QuestionAvailability | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'schedule' | 'monitoring'>('schedule');
  
  // Modal states
  const [selectedQuizForDetails, setSelectedQuizForDetails] = useState<DailyQuiz | null>(null);
  const [selectedQuizForEdit, setSelectedQuizForEdit] = useState<DailyQuiz | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createTargetDate, setCreateTargetDate] = useState<Date | undefined>(undefined);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      initializeData();
    }
  }, [user, loading, router]);

  const initializeData = async () => {
    setIsLoading(true);
    try {
      // Load quiz schedule for the next 7 days
      const schedulePromises = Array.from({ length: 7 }, (_, i) => 
        loadQuizForDay(i)
      );
      
      // Load other data in parallel
      const [
        scheduleResults,
        availabilityResult,
        jobStatusResult
      ] = await Promise.all([
        Promise.allSettled(schedulePromises),
        adminDailyQuizService.getQuestionAvailability().catch(() => null),
        adminDailyQuizService.getJobStatus().catch(() => null)
      ]);

      // Process schedule results
      const schedule: QuizScheduleItem[] = scheduleResults.map((result, i) => {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const label = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : `Day +${i}`;
        
        if (result.status === 'fulfilled') {
          return {
            day: i,
            label,
            date,
            quiz: result.value,
            loading: false
          };
        } else {
          return {
            day: i,
            label,
            date,
            quiz: null,
            loading: false
          };
        }
      });

      setQuizSchedule(schedule);
      setAvailability(availabilityResult);
      setJobStatus(jobStatusResult);
    } catch (error) {
      console.error('Failed to load daily quiz data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadQuizForDay = async (days: number): Promise<DailyQuiz | null> => {
    try {
      const response = await adminDailyQuizService.getQuizByDaysFromNow(days);
      return response.data || null;
    } catch (error) {
      return null;
    }
  };

  const refreshQuizSchedule = async () => {
    setQuizSchedule(prev => prev.map(item => ({ ...item, loading: true })));
    
    const updatedSchedule = await Promise.all(
      quizSchedule.map(async (item) => ({
        ...item,
        quiz: await loadQuizForDay(item.day),
        loading: false
      }))
    );
    
    setQuizSchedule(updatedSchedule);
  };

  const handleCreateQuiz = (targetDate: Date) => {
    setCreateTargetDate(targetDate);
    setCreateModalOpen(true);
  };

  const handleViewDetails = (quiz: DailyQuiz) => {
    setSelectedQuizForDetails(quiz);
  };

  const handleEditQuiz = (quiz: DailyQuiz) => {
    setSelectedQuizForEdit(quiz);
  };

  const handleModalSuccess = () => {
    refreshQuizSchedule();
  };



  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading daily quiz management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Quiz Management</h1>
              <p className="mt-2 text-gray-600">Create, preview, and manage daily quizzes</p>
            </div>
            <button
              onClick={refreshQuizSchedule}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors mr-3"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quiz Schedule
              </button>

              <button
                onClick={() => setActiveTab('monitoring')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'monitoring'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Monitoring
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'schedule' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Quiz Schedule (Next 7 Days)</h2>
              <p className="text-sm text-gray-600">View and manage upcoming daily quizzes</p>
            </div>
            <div className="p-6">
              <div className="grid gap-4">
                {quizSchedule.map((item) => (
                  <QuizScheduleCard
                    key={item.day}
                    day={item.day}
                    label={item.label}
                    date={item.date}
                    quiz={item.quiz}
                    loading={item.loading}
                    onViewDetails={handleViewDetails}
                    onEdit={handleEditQuiz}
                    onCreate={handleCreateQuiz}
                  />
                ))}
              </div>
            </div>
          </div>
        )}



        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            {/* Question Availability Stats */}
            {availability && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Question Pool Health</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {availability.data.totalQuizzes}
                    </div>
                    <div className="text-sm text-gray-600">Total Quizzes</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {availability.data.averageRelaxationLevel.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Avg Relaxation Level</div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {availability.data.recentWarnings.length}
                    </div>
                    <div className="text-sm text-gray-600">Recent Warnings</div>
                  </div>
                </div>
                
                {/* Difficulty Distribution */}
                <div className="mt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Questions by Difficulty</h3>
                  <div className="grid grid-cols-3 gap-4">
                    {Object.entries(availability.data.byDifficulty).map(([difficulty, count]) => (
                      <div key={difficulty} className="text-center p-3 border rounded">
                        <div className="text-lg font-semibold">{count}</div>
                        <div className="text-sm text-gray-600 capitalize">{difficulty}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Job Status */}
            {jobStatus && jobStatus.data && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">System Jobs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {jobStatus.data.dailyQuizCreation && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Daily Quiz Creation</h3>
                      <div className="space-y-2 text-sm">
                        <div>Status: <span className="font-medium capitalize">{jobStatus.data.dailyQuizCreation.status}</span></div>
                        <div>Next Run: <span className="text-gray-600">{new Date(jobStatus.data.dailyQuizCreation.nextRun).toLocaleString()}</span></div>
                        {jobStatus.data.dailyQuizCreation.lastRun && (
                          <div>Last Run: <span className="text-gray-600">{new Date(jobStatus.data.dailyQuizCreation.lastRun).toLocaleString()}</span></div>
                        )}
                      </div>
                    </div>
                  )}
                  {jobStatus.data.templateRetry && (
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">Template Retry</h3>
                      <div className="space-y-2 text-sm">
                        <div>Status: <span className="font-medium capitalize">{jobStatus.data.templateRetry.status}</span></div>
                        <div>Next Run: <span className="text-gray-600">{new Date(jobStatus.data.templateRetry.nextRun).toLocaleString()}</span></div>
                        {jobStatus.data.templateRetry.lastRun && (
                          <div>Last Run: <span className="text-gray-600">{new Date(jobStatus.data.templateRetry.lastRun).toLocaleString()}</span></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <QuizDetailsModal
        quiz={selectedQuizForDetails}
        isOpen={!!selectedQuizForDetails}
        onClose={() => setSelectedQuizForDetails(null)}
        onEdit={handleEditQuiz}
      />

      <CreateQuizModal
        isOpen={createModalOpen}
        targetDate={createTargetDate}
        onClose={() => {
          setCreateModalOpen(false);
          setCreateTargetDate(undefined);
        }}
        onSuccess={handleModalSuccess}
      />

      <EditQuizModal
        quiz={selectedQuizForEdit}
        isOpen={!!selectedQuizForEdit}
        onClose={() => setSelectedQuizForEdit(null)}
        onSuccess={handleModalSuccess}
      />
    </div>
  );
}