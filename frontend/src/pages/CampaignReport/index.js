import React, { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import { 
  Grid, 
  LinearProgress, 
  Typography, 
  Tooltip, 
  Button,
  TextField,
  Select,
  MenuItem,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@material-ui/core";
import { Line, Pie } from 'react-chartjs-2';
import moment from 'moment';
import { toast } from 'react-toastify';
import api from "../../services/api";
import { has, get, isNull } from "lodash";
import CardCounter from "../../components/Dashboard/CardCounter";
import GroupIcon from "@material-ui/icons/Group";
import ScheduleIcon from "@material-ui/icons/Schedule";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import DoneIcon from "@material-ui/icons/Done";
import DoneAllIcon from "@material-ui/icons/DoneAll";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import ListAltIcon from "@material-ui/icons/ListAlt";
import GetAppIcon from '@material-ui/icons/GetApp';
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import { useDate } from "../../hooks/useDate";
import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  textRight: {
    textAlign: "right",
  },
  tabPanelsContainer: {
    padding: theme.spacing(2),
  },
  chartPaper: {
    padding: theme.spacing(2),
    margin: theme.spacing(2, 0),
  },
  filterContainer: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const CampaignReport = () => {
  const classes = useStyles();
  const { campaignId } = useParams();

  // Estados originales
  const [campaign, setCampaign] = useState({});
  const [validContacts, setValidContacts] = useState(0);
  const [delivered, setDelivered] = useState(0);
  const [confirmationRequested, setConfirmationRequested] = useState(0);
  const [confirmed, setConfirmed] = useState(0);
  const [percent, setPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const mounted = useRef(true);

  // Nuevos estados para las mejoras
  const [failedMessages, setFailedMessages] = useState(0);
  const [averageDeliveryTime, setAverageDeliveryTime] = useState(0);
  const [responseRate, setResponseRate] = useState(0);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [performance, setPerformance] = useState({
    messagesPerMinute: 0,
    estimatedTimeRemaining: 0
  });

  const { datetimeToClient } = useDate();
  const socketManager = useContext(SocketContext);

  useEffect(() => {
    if (mounted.current) {
      findCampaign();
    }

    return () => {
      mounted.current = false;
    };
  }, []);

  // Effect original mejorado
  useEffect(() => {
    if (mounted.current && has(campaign, "shipping")) {
      if (has(campaign, "contactList")) {
        const contactList = get(campaign, "contactList");
        const valids = contactList.contacts.filter((c) => c.isWhatsappValid);
        setValidContacts(valids.length);
      }

      if (has(campaign, "shipping")) {
        const contacts = get(campaign, "shipping");
        const delivered = contacts.filter((c) => !isNull(c.deliveredAt));
        const confirmationRequested = contacts.filter(
          (c) => !isNull(c.confirmationRequestedAt)
        );
        const confirmed = contacts.filter(
          (c) => !isNull(c.deliveredAt) && !isNull(c.confirmationRequestedAt)
        );
        
        // Métricas originales
        setDelivered(delivered.length);
        setConfirmationRequested(confirmationRequested.length);
        setConfirmed(confirmed.length);

        // Nuevas métricas
        const failed = contacts.filter(c => c.status === 'FAILED').length;
        setFailedMessages(failed);

        const deliveryTimes = contacts
          .filter(c => c.deliveredAt)
          .map(c => moment(c.deliveredAt).diff(moment(c.sentAt), 'seconds'));
        const avgTime = deliveryTimes.length ? 
          deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length : 0;
        setAverageDeliveryTime(avgTime);

        const responses = contacts.filter(c => c.response).length;
        setResponseRate((responses / contacts.length) * 100);

        // Cálculo de rendimiento
        if (campaign.startedAt) {
          const startTime = moment(campaign.startedAt);
          const now = moment();
          const duration = moment.duration(now.diff(startTime));
          const minutes = duration.asMinutes();
          
          const messagesPerMinute = delivered.length / minutes;
          const remaining = validContacts - delivered.length;
          const estimatedTimeRemaining = remaining / messagesPerMinute;
          
          setPerformance({
            messagesPerMinute: Math.round(messagesPerMinute * 100) / 100,
            estimatedTimeRemaining: Math.round(estimatedTimeRemaining)
          });
        }
      }
    }
  }, [campaign]);

  useEffect(() => {
    setPercent((delivered / validContacts) * 100);
  }, [delivered, validContacts]);

  // Socket effect mejorado
  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketManager.getSocket(companyId);

    const handleUpdate = (data) => {
      if (data.record.id === +campaignId) {
        setCampaign(prev => ({
          ...prev,
          ...data.record,
          shipping: data.record.shipping.map(msg => ({
            ...msg,
            lastUpdate: new Date()
          }))
        }));

        if (data.record.status === "FINALIZADA") {
          setTimeout(() => {
            findCampaign();
          }, 5000);
        }
      }
    };

    socket.on(`company-${companyId}-campaign`, handleUpdate);
    socket.on(`campaign-${campaignId}-message`, handleUpdate);

    return () => {
      socket.off(`company-${companyId}-campaign`, handleUpdate);
      socket.off(`campaign-${campaignId}-message`, handleUpdate);
      socket.disconnect();
    };
  }, [campaignId, socketManager]);

  const findCampaign = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/campaigns/${campaignId}`);
      setCampaign(data);
    } catch (err) {
      setError(err.message);
      toast.error('Error al cargar la campaña');
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (val) => {
    switch (val) {
      case "INATIVA":
        return "Inactiva";
      case "PROGRAMADA":
        return "Programada";
      case "EM_ANDAMENTO":
        return "En Proceso";
      case "CANCELADA":
        return "Cancelada";
      case "FINALIZADA":
        return "Finalizada";
      default:
        return val;
    }
  };

  const exportToCSV = () => {
    if (!campaign.shipping) return;

    const data = campaign.shipping.map(msg => ({
      número: msg.number,
      estado: msg.status,
      enviadoEn: datetimeToClient(msg.sentAt),
      entregadoEn: datetimeToClient(msg.deliveredAt),
      respuesta: msg.response
    }));
    
    const headers = Object.keys(data[0]).join(',');
    const csvData = data.map(row => Object.values(row).join(',')).join('\n');
    const csvContent = `${headers}\n${csvData}`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `campaign-report-${campaign.name}.csv`;
    a.click();
  };

  const filteredContacts = campaign.shipping?.filter(contact => {
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    const matchesSearch = contact.number.includes(searchTerm);
    return matchesStatus && matchesSearch;
  }) || [];

  const chartData = {
    labels: ['Entregados', 'Pendientes', 'Fallidos'],
    datasets: [{
      data: [delivered, validContacts - delivered - failedMessages, failedMessages],
      backgroundColor: ['#4CAF50', '#FFC107', '#F44336']
    }]
  };

  return (
    <MainContainer>
      <MainHeader>
        <Grid style={{ width: "99.6%" }} container>
          <Grid xs={12} item>
            <Title>Informe de {campaign.name || "Campaña"}</Title>
          </Grid>
        </Grid>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        {error && (
          <Typography color="error" gutterBottom>
            {error}
          </Typography>
        )}
        
        <Typography variant="h6" component="h2">
          Status: {formatStatus(campaign.status)} {delivered} de {validContacts}
        </Typography>

        <Paper className={classes.filterContainer}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Buscar por número"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Select
                fullWidth
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <MenuItem value="all">Todos los estados</MenuItem>
                <MenuItem value="SENT">Enviados</MenuItem>
                <MenuItem value="DELIVERED">Entregados</MenuItem>
                <MenuItem value="FAILED">Fallidos</MenuItem>
              </Select>
            </Grid>
          </Grid>
        </Paper>

        <Grid spacing={2} container>
          <Grid xs={12} item>
            <LinearProgress
              variant="determinate"
              style={{ height: 15, borderRadius: 3, margin: "20px 0" }}
              value={percent}
            />
          </Grid>

          {/* Gráfico de estadísticas */}
          <Grid item xs={12} md={6}>
            <Paper className={classes.chartPaper}>
              <Typography variant="h6" gutterBottom>
                Distribución de mensajes
              </Typography>
              <Pie data={chartData} />
            </Paper>
          </Grid>

          {/* Métricas de rendimiento */}
          <Grid item xs={12} md={6}>
            <Paper className={classes.chartPaper}>
              <Typography variant="h6" gutterBottom>
                Métricas de rendimiento
              </Typography>
              <Typography>
                Mensajes por minuto: {performance.messagesPerMinute}
              </Typography>
              <Typography>
                Tiempo estimado restante: {performance.estimatedTimeRemaining} minutos
              </Typography>
              <Typography>
                Tiempo promedio de entrega: {Math.round(averageDeliveryTime)} segundos
              </Typography>
              <Typography>
                Tasa de respuesta: {Math.round(responseRate)}%
              </Typography>
            </Paper>
          </Grid>

          {/* Contadores originales con tooltips */}
          <Grid xs={12} md={4} item>
            <Tooltip title="Número total de contactos válidos en la campaña">
              <div>
                <CardCounter
                  icon={<GroupIcon fontSize="inherit" />}
                  title="Contactos Válidos"
                  value={validContacts}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </Grid>

          {campaign.confirmation && (
            <>
              <Grid xs={12} md={4} item>
                <Tooltip title="Número de confirmaciones solicitadas">
                  <div>
                    <CardCounter
                      icon={<DoneIcon fontSize="inherit" />}
                      title="Confirmaciones solicitadas"
                      value={confirmationRequested}
                      loading={loading}
                    />
                  </div>
                </Tooltip>
              </Grid>
              <Grid xs={12} md={4} item>
                <Tooltip title="Número de confirmaciones recibidas">
                  <div>
                    <CardCounter
                      icon={<DoneAllIcon fontSize="inherit" />}
                      title="Confirmaciones"
                      value={confirmed}
                      loading={loading}
                    />
                  </div>
                </Tooltip>
              </Grid>
            </>
          )}

          <Grid xs={12} md={4} item>
            <Tooltip title="Mensajes entregados exitosamente">
              <div>
                <CardCounter
                  icon={<CheckCircleIcon fontSize="inherit" />}
                  title="Entregados"
                  value={delivered}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </Grid>

          {campaign.whatsappId && (
            <Grid xs={12} md={4} item>
              <Tooltip title="Conexión de WhatsApp utilizada">
                <div>
                  <CardCounter
                    icon={<WhatsAppIcon fontSize="inherit" />}
                    title="Conexión"
                    value={campaign.whatsapp.name}
                    loading={loading}
                  />
                </div>
              </Tooltip>
            </Grid>
          )}

          {campaign.contactListId && (
            <Grid xs={12} md={4} item>
              <Tooltip title="Lista de contactos utilizada">
                <div>
                  <CardCounter
                    icon={<ListAltIcon fontSize="inherit" />}
                    title="Lista de Contactos"
                    value={campaign.contactList.name}
                    loading={loading}
                  />
                </div>
              </Tooltip>
            </Grid>
          )}
                    <Grid xs={12} md={4} item>
            <Tooltip title="Fecha y hora programada">
              <div>
                <CardCounter
                  icon={<ScheduleIcon fontSize="inherit" />}
                  title="Programación"
                  value={datetimeToClient(campaign.scheduledAt)}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </Grid>

          <Grid xs={12} md={4} item>
            <Tooltip title="Fecha y hora de conclusión">
              <div>
                <CardCounter
                  icon={<EventAvailableIcon fontSize="inherit" />}
                  title="Conclusión"
                  value={datetimeToClient(campaign.completedAt)}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </Grid>

          {/* Nuevos contadores */}
          <Grid xs={12} md={4} item>
            <Tooltip title="Mensajes que fallaron en el envío">
              <div>
                <CardCounter
                  icon={<DoneIcon fontSize="inherit" />}
                  title="Mensajes Fallidos"
                  value={failedMessages}
                  loading={loading}
                />
              </div>
            </Tooltip>
          </Grid>

          {/* Botón de exportación */}
          <Grid xs={12} item>
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<GetAppIcon />}
                onClick={exportToCSV}
                disabled={!campaign.shipping || loading}
              >
                Exportar Reporte
              </Button>
            </Box>
          </Grid>

          {/* Tabla de mensajes filtrados */}
          {filteredContacts.length > 0 && (
            <Grid xs={12} item>
              <Paper className={classes.chartPaper}>
                <Typography variant="h6" gutterBottom>
                  Mensajes Filtrados ({filteredContacts.length})
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Número</TableCell>
                      <TableCell>Estado</TableCell>
                      <TableCell>Enviado</TableCell>
                      <TableCell>Entregado</TableCell>
                      <TableCell>Respuesta</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell>{contact.number}</TableCell>
                        <TableCell>{contact.status}</TableCell>
                        <TableCell>{datetimeToClient(contact.sentAt)}</TableCell>
                        <TableCell>{datetimeToClient(contact.deliveredAt)}</TableCell>
                        <TableCell>{contact.response ? 'Sí' : 'No'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Paper>
    </MainContainer>
  );
};

export default CampaignReport;