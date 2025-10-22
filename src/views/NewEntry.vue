<template>
  <div class="new-entry">
    <div class="header">
      <h2>Neuer Timesheet-Eintrag</h2>
      <router-link :to="`/timesheet/${studentId}`" class="btn btn-primary">
        Zurück zum Timesheet
      </router-link>
    </div>

    <div v-if="success" class="success">
      Timesheet-Eintrag erfolgreich erstellt!
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div class="card">
      <form @submit.prevent="submitEntry">
        <div class="form-group">
          <label class="form-label">Schüler</label>
          <input 
            type="text" 
            class="form-input" 
            :value="studentName" 
            disabled 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Projekt *</label>
          <select 
            v-model="formData.ProjectID" 
            class="form-select" 
            required
            :disabled="loadingProjects"
          >
            <option value="">Projekt auswählen</option>
            <option 
              v-for="project in projects" 
              :key="project.ID" 
              :value="project.ID"
            >
              {{ project.Number }} - {{ project.Name }}
            </option>
          </select>
          <div v-if="loadingProjects" class="loading-text">
            Lädt Projekte...
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Datum *</label>
          <input 
            type="date" 
            v-model="formData.Date" 
            class="form-input" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">Minuten *</label>
          <input 
            type="number" 
            v-model="formData.Minutes" 
            class="form-input" 
            min="1" 
            required 
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            <input 
              type="checkbox" 
              v-model="formData.Approved" 
              class="form-checkbox" 
            />
            Genehmigt
          </label>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-success" 
            :disabled="loading"
          >
            <span v-if="loading">Wird gespeichert...</span>
            <span v-else>Eintrag speichern</span>
          </button>
          <router-link 
            :to="`/timesheet/${studentId}`" 
            class="btn btn-primary"
          >
            Abbrechen
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
const API_BASE = 'https://projects.sbw.media';

export default {
  name: 'NewEntry',
  props: {
    studentId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      formData: {
        ProjectID: '',
        StudentID: this.studentId,
        Date: this.getTodayDate(),
        Minutes: 60,
        Approved: false
      },
      projects: [],
      studentName: '',
      loading: false,
      loadingProjects: false,
      error: null,
      success: false
    }
  },
  async mounted() {
    await this.loadStudentData();
    await this.loadProjects();
  },
  methods: {
    getTodayDate() {
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    async loadStudentData() {
      try {
        const response = await fetch(`${API_BASE}/Student/${this.studentId}`);
        if (response.ok) {
          const data = await response.json();
          this.studentName = data.Fullname || 'Unbekannter Schüler';
        }
      } catch (err) {
        console.error('Error loading student data:', err);
      }
    },
    async loadProjects() {
      this.loadingProjects = true;
      try {
        const response = await fetch(`${API_BASE}/Project`);
        if (!response.ok) {
          throw new Error(`HTTP Fehler! Status: ${response.status}`);
        }
        const data = await response.json();
        this.projects = data.resources || [];
      } catch (err) {
        this.error = `Fehler beim Laden der Projekte: ${err.message}`;
        console.error('Error loading projects:', err);
      } finally {
        this.loadingProjects = false;
      }
    },
    async submitEntry() {
      this.loading = true;
      this.error = null;
      this.success = false;

      try {
        const payload = {
          ProjectID: parseInt(this.formData.ProjectID),
          StudentID: parseInt(this.formData.StudentID),
          Date: this.formData.Date,
          Minutes: parseInt(this.formData.Minutes),
          Approved: this.formData.Approved ? 1 : 0
        };

        const response = await fetch(`${API_BASE}/Timesheet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`HTTP Fehler! Status: ${response.status}`);
        }

        const data = await response.json();
        this.success = true;
        
        // Formular zurücksetzen
        this.formData.ProjectID = '';
        this.formData.Date = this.getTodayDate();
        this.formData.Minutes = 60;
        this.formData.Approved = false;

        // Nach 2 Sekunden weiterleiten
        setTimeout(() => {
          this.$router.push(`/timesheet/${this.studentId}`);
        }, 2000);

      } catch (err) {
        this.error = `Fehler beim Erstellen des Eintrags: ${err.message}`;
        console.error('Error creating entry:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.form-checkbox {
  margin-right: 0.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.loading-text {
  color: #667eea;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h2 {
  color: #2d3748;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-actions {
    flex-direction: column;
  }
}
</style>