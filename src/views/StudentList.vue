<template>
  <div class="student-list">
    <div class="header">
      <h2>Schülerauswahl</h2>
      <p>Wählen Sie einen Schüler aus, um dessen Timesheet einzusehen oder neue Einträge zu erfassen.</p>
    </div>

    <div v-if="loading" class="loading">
      Lädt Schülerliste...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="students.length > 0" class="students-grid">
      <div 
        v-for="student in students" 
        :key="student.ID" 
        class="student-card"
        @click="selectStudent(student)"
      >
        <h3>{{ student.Fullname }}</h3>
        <p><strong>Vorname:</strong> {{ student.Firstname }}</p>
        <p><strong>Nachname:</strong> {{ student.Name }}</p>
        <p><strong>Jahrgang:</strong> {{ student.Year }}</p>
        <div class="student-actions">
          <router-link 
            :to="`/timesheet/${student.ID}`" 
            class="btn btn-primary"
            @click.stop
          >
            Timesheet anzeigen
          </router-link>
          <router-link 
            :to="`/new-entry/${student.ID}`" 
            class="btn btn-success"
            @click.stop
          >
            Neuer Eintrag
          </router-link>
        </div>
      </div>
    </div>

    <div v-if="!loading && students.length === 0" class="no-data">
      Keine Schüler gefunden.
    </div>
  </div>
</template>

<script>
const API_BASE = 'https://projects.sbw.media';

export default {
  name: 'StudentList',
  data() {
    return {
      students: [],
      loading: false,
      error: null
    }
  },
  async mounted() {
    await this.loadStudents();
  },
  methods: {
    async loadStudents() {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await fetch(`${API_BASE}/Student`);
        if (!response.ok) {
          throw new Error(`HTTP Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        this.students = data.resources || [];
      } catch (err) {
        this.error = `Fehler beim Laden der Schüler: ${err.message}`;
        console.error('Error loading students:', err);
      } finally {
        this.loading = false;
      }
    },
    selectStudent(student) {
      // Kann für weitere Interaktionen verwendet werden
      console.log('Selected student:', student);
    }
  }
}
</script>

<style scoped>
.students-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.student-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid transparent;
}

.student-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  border-color: #667eea;
}

.student-card h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.student-card p {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.student-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.student-actions .btn {
  flex: 1;
  min-width: 120px;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.header p {
  color: #718096;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-style: italic;
}
</style>