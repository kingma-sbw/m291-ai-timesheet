<template>
  <div class="timesheet-view">
    <div class="header">
      <h2>Timesheet für {{ studentName }}</h2>
      <div class="header-actions">
        <router-link to="/" class="btn btn-primary">Zurück zur Liste</router-link>
        <router-link :to="`/new-entry/${studentId}`" class="btn btn-success">
          Neuer Eintrag
        </router-link>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Lädt Timesheet-Einträge...
    </div>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <div v-if="timesheetEntries.length > 0" class="timesheet-table">
      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Projekt</th>
            <th>Projektnummer</th>
            <th>Minuten</th>
            <th>Status</th>
            <th>Aktionen</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in timesheetEntries" :key="entry.ID">
            <td>{{ formatDate(entry.Date) }}</td>
            <td>{{ entry.ProjectName }}</td>
            <td>{{ entry.Number }}</td>
            <td>{{ entry.Minutes }}</td>
            <td>
              <span :class="['status', entry.Approved ? 'approved' : 'pending']">
                {{ entry.Approved ? 'Genehmigt' : 'Ausstehend' }}
              </span>
            </td>
            <td>
              <button 
                @click="deleteEntry(entry.ID)" 
                class="btn btn-danger btn-sm"
                :disabled="loading"
              >
                Löschen
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && timesheetEntries.length === 0" class="no-data">
      Keine Timesheet-Einträge gefunden für diesen Schüler.
    </div>

    <div class="summary">
      <h3>Zusammenfassung</h3>
      <p><strong>Gesamtminuten:</strong> {{ totalMinutes }}</p>
      <p><strong>Genehmigte Minuten:</strong> {{ approvedMinutes }}</p>
      <p><strong>Ausstehende Minuten:</strong> {{ pendingMinutes }}</p>
    </div>
  </div>
</template>

<script>
const API_BASE = 'https://projects.sbw.media';

export default {
  name: 'TimesheetView',
  props: {
    studentId: {
      type: [String, Number],
      required: true
    }
  },
  data() {
    return {
      timesheetEntries: [],
      studentName: '',
      loading: false,
      error: null
    }
  },
  computed: {
    totalMinutes() {
      return this.timesheetEntries.reduce((sum, entry) => sum + entry.Minutes, 0);
    },
    approvedMinutes() {
      return this.timesheetEntries
        .filter(entry => entry.Approved)
        .reduce((sum, entry) => sum + entry.Minutes, 0);
    },
    pendingMinutes() {
      return this.timesheetEntries
        .filter(entry => !entry.Approved)
        .reduce((sum, entry) => sum + entry.Minutes, 0);
    }
  },
  async mounted() {
    await this.loadTimesheetData();
  },
  methods: {
    async loadTimesheetData() {
      this.loading = true;
      this.error = null;
      
      try {
        // Lade Timesheet-Einträge für den Schüler
        const timesheetResponse = await fetch(`${API_BASE}/TimesheetView/?StudentID=${this.studentId}`);
        if (!timesheetResponse.ok) {
          throw new Error(`HTTP Fehler! Status: ${timesheetResponse.status}`);
        }
        
        const timesheetData = await timesheetResponse.json();
        this.timesheetEntries = timesheetData.resources || [];
        
        // Hole Schülerinformationen für den Namen
        if (this.timesheetEntries.length > 0) {
          this.studentName = this.timesheetEntries[0].Fullname;
        } else {
          // Falls keine Einträge vorhanden, lade Schülerdaten separat
          const studentResponse = await fetch(`${API_BASE}/Student/${this.studentId}`);
          if (studentResponse.ok) {
            const studentData = await studentResponse.json();
            this.studentName = studentData.resources?.Fullname || 'Unbekannter Schüler';
          }
        }
      } catch (err) {
        this.error = `Fehler beim Laden der Timesheet-Daten: ${err.message}`;
        console.error('Error loading timesheet data:', err);
      } finally {
        this.loading = false;
      }
    },
    formatDate(dateString) {
      if (!dateString) return 'Unbekannt';
      const date = new Date(dateString);
      return date.toLocaleDateString('de-DE');
    },
    async deleteEntry(entryId) {
      if (!confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
        return;
      }

      this.loading = true;
      try {
        const response = await fetch(`${API_BASE}/Timesheet/${entryId}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP Fehler! Status: ${response.status}`);
        }

        // Entferne den Eintrag aus der Liste
        this.timesheetEntries = this.timesheetEntries.filter(entry => entry.ID !== entryId);
        
      } catch (err) {
        this.error = `Fehler beim Löschen des Eintrags: ${err.message}`;
        console.error('Error deleting entry:', err);
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.timesheet-table {
  overflow-x: auto;
  margin-bottom: 2rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

th {
  background-color: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

tr:hover {
  background-color: #f7fafc;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status.approved {
  background-color: #c6f6d5;
  color: #276749;
}

.status.pending {
  background-color: #feebc8;
  color: #744210;
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

.header-actions {
  display: flex;
  gap: 1rem;
}

.summary {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.summary h3 {
  margin-bottom: 1rem;
  color: #2d3748;
}

.summary p {
  margin-bottom: 0.5rem;
  color: #4a5568;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.no-data {
  text-align: center;
  padding: 3rem;
  color: #718096;
  font-style: italic;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>