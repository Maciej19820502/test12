import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password");
  if (password !== "MACIEK2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all users who have at least one completed tool session
  const { data: sessions, error: sessionsError } = await supabase
    .from("tool_sessions")
    .select("user_id, tool_name, status, completed_at")
    .eq("status", "completed");

  if (sessionsError) {
    return NextResponse.json({ error: sessionsError.message }, { status: 500 });
  }

  if (!sessions || sessions.length === 0) {
    return NextResponse.json({ participants: [] });
  }

  // Get unique user IDs with completed sessions
  const userIds = [...new Set(sessions.map((s) => s.user_id))];

  // Fetch user details
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, created_at")
    .in("id", userIds);

  // Fetch projects with related data
  const { data: projects } = await supabase
    .from("projects")
    .select("id, user_id, topic_title, topic_description, status")
    .in("user_id", userIds);

  const projectIds = (projects || []).map((p) => p.id);

  // Fetch PM reviews, CFO reviews, defense results, and project cards in parallel
  const [pmRes, cfoRes, defenseRes, cardsRes] = await Promise.all([
    projectIds.length > 0
      ? supabase
          .from("pm_reviews")
          .select("project_id, e1_score, e2_score, e3_score, e4_score, e5_score, average_score, recommendations")
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("cfo_reviews")
          .select("project_id, approved, review_text, requirements")
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("defense_results")
          .select("project_id, decision, notes_summary")
          .in("project_id", projectIds)
      : { data: [] },
    projectIds.length > 0
      ? supabase
          .from("project_cards")
          .select("project_id, section_1, section_2, section_3, section_4, section_5, section_6, section_7, section_8")
          .in("project_id", projectIds)
      : { data: [] },
  ]);

  const pmReviews = pmRes.data || [];
  const cfoReviews = cfoRes.data || [];
  const defenseResults = defenseRes.data || [];
  const projectCards = cardsRes.data || [];

  // Build participant summaries
  const participants = (users || []).map((user) => {
    const userSessions = sessions.filter((s) => s.user_id === user.id);
    const completedTools = userSessions.map((s) => s.tool_name).sort();

    const userProject = (projects || []).find((p) => p.user_id === user.id);
    const projectId = userProject?.id;

    const pmReview = projectId
      ? pmReviews.find((r) => r.project_id === projectId)
      : null;
    const cfoReview = projectId
      ? cfoReviews.find((r) => r.project_id === projectId)
      : null;
    const defense = projectId
      ? defenseResults.find((r) => r.project_id === projectId)
      : null;
    const card = projectId
      ? projectCards.find((r) => r.project_id === projectId)
      : null;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at,
      projectTitle: userProject?.topic_title || null,
      projectDescription: userProject?.topic_description || null,
      completedTools,
      completedCount: completedTools.length,
      pmScores: pmReview
        ? {
            e1: pmReview.e1_score,
            e2: pmReview.e2_score,
            e3: pmReview.e3_score,
            e4: pmReview.e4_score,
            e5: pmReview.e5_score,
            average: pmReview.average_score,
          }
        : null,
      pmRecommendations: pmReview?.recommendations ?? null,
      cfoApproved: cfoReview?.approved ?? null,
      cfoReviewText: cfoReview?.review_text ?? null,
      cfoRequirements: cfoReview?.requirements ?? null,
      defenseDecision: defense?.decision ?? null,
      defenseNotes: defense?.notes_summary ?? null,
      projectCard: card
        ? {
            s1: card.section_1,
            s2: card.section_2,
            s3: card.section_3,
            s4: card.section_4,
            s5: card.section_5,
            s6: card.section_6,
            s7: card.section_7,
            s8: card.section_8,
          }
        : null,
    };
  });

  // Sort by completed count descending
  participants.sort((a, b) => b.completedCount - a.completedCount);

  return NextResponse.json({ participants });
}
