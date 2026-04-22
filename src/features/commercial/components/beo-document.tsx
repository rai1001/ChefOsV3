'use client'

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { BeoData } from '../domain/types'
import { EVENT_STATUS_LABELS, EVENT_TYPE_LABELS, SERVICE_TYPE_LABELS } from '../domain/invariants'

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    lineHeight: 1.4,
  },
  header: {
    borderBottom: '2pt solid #1a1a1a',
    paddingBottom: 8,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: 700 },
  subtitle: { fontSize: 9, color: '#666', marginTop: 4 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: '#555',
  },
  grid2: { flexDirection: 'row', gap: 16 },
  col: { flex: 1 },
  label: {
    fontSize: 8,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: { fontSize: 10, marginBottom: 4 },
  menuSection: {
    marginBottom: 8,
    padding: 6,
    border: '1pt solid #ddd',
    borderRadius: 3,
  },
  menuName: { fontSize: 11, fontWeight: 700, marginBottom: 4 },
  sectionName: { fontSize: 10, fontWeight: 700, marginTop: 4 },
  recipeLine: { fontSize: 9, color: '#444', marginLeft: 6 },
  deptBlock: { marginBottom: 6 },
  deptName: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#555' },
  impactItem: {
    fontSize: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: 6,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTop: '1pt solid #ccc',
    paddingTop: 4,
    marginTop: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 7,
    color: '#999',
    textAlign: 'center',
  },
})

function fmtCurrency(n: number | null | undefined) {
  if (n == null) return '—'
  return n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

export function BeoDocument({ data }: { data: BeoData }) {
  return (
    <Document title={`BEO ${data.beo_number ?? data.id}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Banquet Event Order</Text>
          <Text style={styles.subtitle}>
            {data.hotel.name} · BEO {data.beo_number ?? '—'} · Estado:{' '}
            {EVENT_STATUS_LABELS[data.status]}
          </Text>
        </View>

        <View style={styles.grid2}>
          <View style={styles.col}>
            <Text style={styles.label}>Evento</Text>
            <Text style={styles.value}>{data.name}</Text>
            <Text style={styles.label}>Fecha</Text>
            <Text style={styles.value}>{data.event_date}</Text>
            <Text style={styles.label}>Tipo / Servicio</Text>
            <Text style={styles.value}>
              {EVENT_TYPE_LABELS[data.event_type]} · {SERVICE_TYPE_LABELS[data.service_type]}
            </Text>
            <Text style={styles.label}>Horario</Text>
            <Text style={styles.value}>
              {data.start_time ?? '—'} – {data.end_time ?? '—'}
            </Text>
            <Text style={styles.label}>Pax</Text>
            <Text style={styles.value}>{data.guest_count}</Text>
            <Text style={styles.label}>Venue</Text>
            <Text style={styles.value}>{data.venue ?? '—'}</Text>
          </View>

          <View style={styles.col}>
            <Text style={styles.label}>Cliente</Text>
            <Text style={styles.value}>{data.client?.name ?? '—'}</Text>
            <Text style={styles.label}>Empresa</Text>
            <Text style={styles.value}>{data.client?.company ?? '—'}</Text>
            <Text style={styles.label}>Contacto</Text>
            <Text style={styles.value}>
              {data.client?.email ?? '—'} {data.client?.phone ? `· ${data.client.phone}` : ''}
            </Text>
          </View>
        </View>

        {data.spaces.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Espacios</Text>
            {data.spaces.map((sp, idx) => (
              <Text key={idx} style={styles.value}>
                {sp.space_name}
                {sp.capacity ? ` (${sp.capacity} pax)` : ''}
                {sp.setup_style ? ` · ${sp.setup_style}` : ''}
              </Text>
            ))}
          </>
        )}

        <Text style={styles.sectionHeader}>Menús</Text>
        {data.menus.length === 0 && <Text style={styles.value}>Sin menús asignados.</Text>}
        {data.menus.map((menu) => (
          <View key={menu.id} style={styles.menuSection}>
            <Text style={styles.menuName}>
              {menu.menu_name}
              {menu.servings_override ? ` (${menu.servings_override} pax)` : ''}
            </Text>
            {menu.sections.map((s) => (
              <View key={s.id}>
                <Text style={styles.sectionName}>
                  {s.name}
                  {s.course_type ? ` — ${s.course_type}` : ''}
                </Text>
                {s.recipes.map((r) => (
                  <Text key={r.id} style={styles.recipeLine}>
                    • {r.name}
                    {r.unit_cost != null ? ` · ${fmtCurrency(r.unit_cost)}/pax` : ''}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        ))}

        {data.operational_impact.length > 0 && (
          <>
            <Text style={styles.sectionHeader}>Impacto operacional</Text>
            {data.operational_impact.map((dept) => (
              <View key={dept.department} style={styles.deptBlock}>
                <Text style={styles.deptName}>{dept.department}</Text>
                {dept.items.map((it, idx) => (
                  <View key={idx} style={styles.impactItem}>
                    <Text>{it.product_name}</Text>
                    <Text>
                      {it.quantity_needed} {it.unit ?? ''}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </>
        )}

        <Text style={styles.sectionHeader}>Costes</Text>
        <View style={styles.costRow}>
          <Text>Coste teórico estimado</Text>
          <Text>{fmtCurrency(data.theoretical_cost)}</Text>
        </View>
        <View style={styles.costRow}>
          <Text>Coste real</Text>
          <Text>{fmtCurrency(data.actual_cost)}</Text>
        </View>

        <Text style={styles.footer}>
          Generado por ChefOS v3 · {new Date().toLocaleString('es-ES')}
        </Text>
      </Page>
    </Document>
  )
}
