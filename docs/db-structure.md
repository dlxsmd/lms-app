# Supabase データ構造仕様書

## 概要

この文書では、学習管理システム（LMS）のSupabaseデータベース構造について詳細に説明します。データベースは教師と学生のインタラクション、コース管理、課題提出などの機能をサポートするように設計されています。

## テーブル構造

### 1. users テーブル

ユーザー情報を管理するテーブルです。教師と学生の両方のユーザータイプをサポートします。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | ユーザーの一意識別子 | PRIMARY KEY |
| email | text | ユーザーのメールアドレス | UNIQUE, NOT NULL |
| first_name | text | ユーザーの名 | NOT NULL |
| last_name | text | ユーザーの姓 | NOT NULL |
| role | text | ユーザーの役割（"teacher"または"student"） | NOT NULL |
| avatar_url | text | プロフィール画像のURL | NULLABLE |
| created_at | timestamp | ユーザー作成日時 | NOT NULL, DEFAULT now() |
| last_login | timestamp | 最終ログイン日時 | NULLABLE |

```sql
CREATE TYPE user_role AS ENUM ('teacher', 'student');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

### 2. courses テーブル

教師が作成するコースの情報を格納するテーブルです。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | コースの一意識別子 | PRIMARY KEY |
| title | text | コースのタイトル | NOT NULL |
| description | text | コースの説明 | NOT NULL |
| teacher_id | uuid | コースを作成した教師のID | FOREIGN KEY (users) |
| cover_image_url | text | コースのカバー画像URL | NULLABLE |
| is_active | boolean | コースがアクティブかどうか | NOT NULL, DEFAULT true |
| created_at | timestamp | コース作成日時 | NOT NULL, DEFAULT now() |
| updated_at | timestamp | コース更新日時 | NOT NULL, DEFAULT now() |

```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES users(id),
  cover_image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 3. course_enrollments テーブル

学生のコース登録情報を管理するテーブルです。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | 登録の一意識別子 | PRIMARY KEY |
| course_id | uuid | 登録先コースのID | FOREIGN KEY (courses) |
| student_id | uuid | 登録する学生のID | FOREIGN KEY (users) |
| enrollment_date | timestamp | 登録日時 | NOT NULL, DEFAULT now() |
| status | text | 登録状態（"active", "completed", "dropped"） | NOT NULL |

```sql
CREATE TYPE enrollment_status AS ENUM ('active', 'completed', 'dropped');

CREATE TABLE course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  student_id UUID NOT NULL REFERENCES users(id),
  enrollment_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  status enrollment_status NOT NULL DEFAULT 'active',
  UNIQUE(course_id, student_id)
);
```

### 4. assignments テーブル

コースに関連する課題情報を格納するテーブルです。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | 課題の一意識別子 | PRIMARY KEY |
| course_id | uuid | 課題が属するコースのID | FOREIGN KEY (courses) |
| title | text | 課題のタイトル | NOT NULL |
| description | text | 課題の説明 | NOT NULL |
| problem_type | text | 問題タイプ | NOT NULL |
| content | jsonb | 問題の内容（JSONフォーマット） | NOT NULL |
| due_date | timestamp | 提出期限 | NOT NULL |
| points_possible | integer | 可能な最大得点 | NOT NULL |
| created_at | timestamp | 課題作成日時 | NOT NULL, DEFAULT now() |
| updated_at | timestamp | 課題更新日時 | NOT NULL, DEFAULT now() |
| allow_resubmission | boolean | 再提出を許可するか | NOT NULL, DEFAULT false |
| max_attempts | integer | 最大試行回数 | NULLABLE |

```sql
CREATE TYPE problem_type AS ENUM ('multiple_choice', 'short_answer', 'essay', 'file_upload', 'code');

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  problem_type problem_type NOT NULL,
  content JSONB NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  points_possible INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  allow_resubmission BOOLEAN NOT NULL DEFAULT FALSE,
  max_attempts INTEGER
);
```

### 5. submissions テーブル

学生の課題提出情報を格納するテーブルです。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | 提出物の一意識別子 | PRIMARY KEY |
| assignment_id | uuid | 提出された課題のID | FOREIGN KEY (assignments) |
| student_id | uuid | 提出した学生のID | FOREIGN KEY (users) |
| submitted_at | timestamp | 提出日時 | NOT NULL, DEFAULT now() |
| submission_content | jsonb | 提出内容（JSONフォーマット） | NOT NULL |
| grade | numeric | 採点結果 | NULLABLE |
| feedback | text | 教師からのフィードバック | NULLABLE |
| graded_by | uuid | 採点した教師のID | FOREIGN KEY (users), NULLABLE |
| graded_at | timestamp | 採点日時 | NULLABLE |
| submission_number | integer | 提出回数 | NOT NULL, DEFAULT 1 |

```sql
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES assignments(id),
  student_id UUID NOT NULL REFERENCES users(id),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  submission_content JSONB NOT NULL,
  grade NUMERIC,
  feedback TEXT,
  graded_by UUID REFERENCES users(id),
  graded_at TIMESTAMP WITH TIME ZONE,
  submission_number INTEGER NOT NULL DEFAULT 1
);
```

### 6. materials テーブル

コースの教材情報を格納するテーブルです。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | 教材の一意識別子 | PRIMARY KEY |
| course_id | uuid | 教材が属するコースのID | FOREIGN KEY (courses) |
| title | text | 教材のタイトル | NOT NULL |
| description | text | 教材の説明 | NOT NULL |
| type | text | 教材タイプ | NOT NULL |
| content_url | text | 教材コンテンツのURL | NOT NULL |
| created_at | timestamp | 教材作成日時 | NOT NULL, DEFAULT now() |
| updated_at | timestamp | 教材更新日時 | NOT NULL, DEFAULT now() |

```sql
CREATE TYPE material_type AS ENUM ('document', 'video', 'link', 'other');

CREATE TABLE materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES courses(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type material_type NOT NULL,
  content_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 7. activities テーブル

システム内でのユーザーアクティビティを記録するテーブルです。

| フィールド | データ型 | 説明 | 制約 |
|------------|----------|------|------|
| id | uuid | アクティビティの一意識別子 | PRIMARY KEY |
| user_id | uuid | アクティビティを行ったユーザーのID | FOREIGN KEY (users) |
| type | text | アクティビティタイプ | NOT NULL |
| content | jsonb | アクティビティの詳細情報（JSONフォーマット） | NOT NULL |
| created_at | timestamp | アクティビティ発生日時 | NOT NULL, DEFAULT now() |

```sql
CREATE TYPE activity_type AS ENUM ('submission', 'grade_received', 'feedback_received', 'course_enrolled', 'assignment_created');

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  type activity_type NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

## リレーションシップ

```
          has_many                             enrolls_in
users ───────────────────┐       ┌────────── users (students)
 │                       │       │           │
 │ created_by            │       │           │
 │                       ▼       ▼           │
 └───────────► courses ◄─────────┘           │
                 │                           │
                 │ belongs_to                │
                 │                           │
                 ▼                           │
          assignments ◄────────────────────┐ │
                 │                         │ │
                 │ belongs_to              │ │
                 │                         │ │
                 ▼                         │ │
           submissions ◄─────────────────────┘
                 │
                 │ records
                 │
                 ▼
           activities
```

## インデックス

パフォーマンスを最適化するためのインデックス：

```sql
-- コース検索の効率化
CREATE INDEX idx_courses_teacher_id ON courses(teacher_id);

-- 課題管理の効率化
CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- 提出物管理の効率化
CREATE INDEX idx_submissions_assignment_id ON submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON submissions(student_id);
CREATE INDEX idx_submissions_submitted_at ON submissions(submitted_at);

-- 登録管理の効率化
CREATE INDEX idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX idx_enrollments_student_id ON course_enrollments(student_id);

-- アクティビティ検索の効率化
CREATE INDEX idx_activities_user_id ON activities(user_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);
```

## スキーマ拡張の可能性

将来のシステム拡張に備えて、以下のようなテーブルの追加を検討できます：

1. **通知テーブル**: ユーザーへの通知を管理
2. **クイズ結果テーブル**: 小テストの結果を詳細に記録
3. **ディスカッションテーブル**: コース内のディスカッション機能をサポート
4. **グループテーブル**: 学生のグループワークをサポート
5. **カレンダーイベントテーブル**: コースのスケジュール管理

## 行レベルセキュリティポリシー

Supabaseでは行レベルセキュリティ（RLS）ポリシーを設定して、適切なアクセス制御を実装することが重要です：

```sql
-- 全テーブルでRLSを有効化
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 例: コーステーブルのRLSポリシー
-- 教師は自分のコースのみ編集可能
CREATE POLICY "Teachers can update their own courses" 
ON courses FOR UPDATE 
TO authenticated
USING (teacher_id = auth.uid());

-- 例: 提出物テーブルのRLSポリシー
-- 学生は自分の提出物のみ閲覧可能
CREATE POLICY "Students can view their own submissions" 
ON submissions FOR SELECT 
TO authenticated
USING (student_id = auth.uid());

-- 教師はコースに関連する全提出物を閲覧可能
CREATE POLICY "Teachers can view all submissions for their courses" 
ON submissions FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM assignments a
    JOIN courses c ON a.course_id = c.id
    WHERE submissions.assignment_id = a.id
    AND c.teacher_id = auth.uid()
  )
);
```

## データ型と制約のまとめ

| エンティティ | 主なデータ型 | 制約 | 関連付け |
|------------|------------|------|----------|
| User | UUID, Text, Timestamp | Email Unique | Courses, Submissions, Activities |
| Course | UUID, Text, Boolean | Title Required | Users, Assignments, Materials |
| Assignment | UUID, Text, JSONB, Timestamp | Due Date Required | Courses, Submissions |
| Submission | UUID, JSONB, Numeric | Content Required | Assignments, Users |
| Material | UUID, Text, URL | Content URL Required | Courses |
| Activity | UUID, JSONB, Timestamp | Type Required | Users |

## まとめ

このデータ構造は、学習管理システムのコア機能をサポートするように設計されており、Supabaseの機能を最大限に活用しています。行レベルセキュリティを適切に設定することで、データアクセスのセキュリティを確保しながら、教師と学生それぞれに必要な操作を可能にします。