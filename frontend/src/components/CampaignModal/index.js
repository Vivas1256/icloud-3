import React, { useContext, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { Field, Form, Formik } from "formik";
import { head } from "lodash";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Tab,
  Tabs,
} from "@material-ui/core";
import { green } from "@material-ui/core/colors";
import { makeStyles } from "@material-ui/core/styles";
import { AttachFile as AttachFileIcon, DeleteOutline as DeleteOutlineIcon } from "@material-ui/icons";
import Autocomplete from '@material-ui/lab/Autocomplete';
import PropTypes from 'prop-types';
import moment from 'moment-timezone';

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import ConfirmationModal from "../ConfirmationModal";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    backgroundColor: "#fff"
  },
  tabmsg: {
    backgroundColor: theme.palette.campaigntab,
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1,
  },
  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const CampaignSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Required"),
  status: Yup.string().oneOf(['Inactiva', 'PROGRAMADA', 'Proceso', 'PAUSADA', 'CANCELADA', 'FINALIZADA'], "Estado inválido"),
});

const CampaignModal = ({ open, onClose, campaignId, initialValues, onSave, resetPagination }) => {
  const classes = useStyles();
  const isMounted = useRef(true);
  const { user } = useContext(AuthContext);
  const { companyId } = user;
  const [file, setFile] = useState(null);

  const initialState = {
    name: "",
    message1: "",
    message2: "",
    message3: "",
    message4: "",
    message5: "",
    confirmationMessage1: "",
    confirmationMessage2: "",
    confirmationMessage3: "",
    confirmationMessage4: "",
    confirmationMessage5: "",
    status: "Inactiva",
    confirmation: false,
    scheduledAt: "",
    whatsappId: "",
    contactListId: "",
    tagListId: "Ninguno",
    companyId,
  };

  const [campaign, setCampaign] = useState(initialState);
  const [whatsapps, setWhatsapps] = useState([]);
  const [contactLists, setContactLists] = useState([]);
  const [messageTab, setMessageTab] = useState(0);
  const [attachment, setAttachment] = useState(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [campaignEditable, setCampaignEditable] = useState(true);
  const attachmentFile = useRef(null);
  const [tagLists, setTagLists] = useState([]);

  const memoizedContactLists = useMemo(() => contactLists, [contactLists]);
  const memoizedTagLists = useMemo(() => tagLists, [tagLists]);
  const memoizedWhatsapps = useMemo(() => whatsapps, [whatsapps]);
  const memoizedFiles = useMemo(() => Array.isArray(file) ? file : [], [file]);

  const fetchInitialData = useCallback(async () => {
    try {
      const [contactListsResponse, whatsappsResponse, tagsResponse] = await Promise.all([
        api.get(`/contact-lists/list`, { params: { companyId } }),
        api.get(`/whatsapp`, { params: { companyId, session: 0 } }),
        api.get(`/tags`, { params: { companyId } })
      ]);

      setContactLists(contactListsResponse.data);
      setWhatsapps(whatsappsResponse.data);
      
      const fetchedTags = tagsResponse.data.tags;
      const formattedTagLists = fetchedTags.map((tag) => ({
        id: tag.id,
        name: tag.name,
      }));
      setTagLists(formattedTagLists);

    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error(i18n.t("campaigns.fetchError"));
    }
  }, [companyId]);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/files/", {
          params: { companyId }
        });
        setFile(data.files);
      } catch (err) {
        toastError(err);
      }
    })();
  }, [companyId]);

  useEffect(() => {
    if (isMounted.current) {
      if (initialValues) {
        setCampaign((prevState) => {
          return { ...prevState, ...initialValues };
        });
      }
  
      fetchInitialData();
      
      if (campaignId) {
        api.get(`/campaigns/${campaignId}`)
          .then(({ data }) => {
            setCampaign((prev) => {
              let prevCampaignData = { ...prev };
  
              Object.entries(data).forEach(([key, value]) => {
                if (key === "scheduledAt" && value !== "" && value !== null) {
                  // Convertir UTC a hora local
                  const utcTime = moment.utc(value);
                  const localTime = utcTime.local().format("YYYY-MM-DDTHH:mm");
                  prevCampaignData[key] = localTime;
                } else {
                  prevCampaignData[key] = value === null ? "" : value;
                }
              });
  
              return prevCampaignData;
            });
          })
          .catch(error => {
            console.error("Error fetching campaign data:", error);
            toast.error(i18n.t("campaigns.fetchCampaignError"));
            setCampaign((prev) => ({ ...prev }));
          });
      }
    }
  }, [campaignId, initialValues, companyId, fetchInitialData]);
  
  useEffect(() => {
    const now = moment();
    const scheduledAt = moment(campaign.scheduledAt);
    const moreThenAnHour =
      !Number.isNaN(scheduledAt.diff(now)) && scheduledAt.diff(now, "hour") > 1;
    const isEditable =
      campaign.status === "Inactiva" ||
      campaign.status === "PROGRAMADA" ||
      (campaign.status === "PAUSADA" && moreThenAnHour);

    setCampaignEditable(isEditable);
  }, [campaign.status, campaign.scheduledAt]);

  const handleClose = () => {
    onClose();
    setCampaign(initialState);
  };

  const handleAttachmentFile = (e) => {
    const file = head(e.target.files);
    if (file) {
      setAttachment(file);
    }
  };

  const handleSaveCampaign = async (values) => {
    try {
      const dataValues = {};
      Object.entries(values).forEach(([key, value]) => {
        if (key === "scheduledAt" && value !== "" && value !== null) {
          // Convertir la hora local a UTC
          const localTime = moment(value);
          const utcTime = localTime.utc().format("YYYY-MM-DD HH:mm:ss");
          dataValues[key] = utcTime;
        } else {
          dataValues[key] = value === "" ? null : value;
        }
      });
  
      if (campaignId) {
        await api.put(`/campaigns/${campaignId}`, dataValues);
  
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${campaignId}/media-upload`, formData);
        }
        handleClose();
      } else {
        const { data } = await api.post("/campaigns", dataValues);
  
        if (attachment != null) {
          const formData = new FormData();
          formData.append("file", attachment);
          await api.post(`/campaigns/${data.id}/media-upload`, formData);
        }
        if (onSave) {
          onSave(data);
        }
        handleClose();
      }
      toast.success(i18n.t("campaigns.toasts.success"));
    } catch (err) {
      console.log(err);
      toastError(err);
    }
  };

  const deleteMedia = async () => {
    if (attachment) {
      setAttachment(null);
      attachmentFile.current.value = null;
    }

    if (campaign.mediaPath) {
      await api.delete(`/campaigns/${campaign.id}/media-upload`);
      setCampaign((prev) => ({ ...prev, mediaPath: null, mediaName: null }));
      toast.success(i18n.t("campaigns.toasts.deleted"));
    }
  };

  const renderMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        helperText="Utilize variáveis como {nome}, {numero}, {email} ou defina variáveis personalziadas."
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const renderConfirmationMessageField = (identifier) => {
    return (
      <Field
        as={TextField}
        id={identifier}
        name={identifier}
        fullWidth
        rows={5}
        label={i18n.t(`campaigns.dialog.form.${identifier}`)}
        placeholder={i18n.t("campaigns.dialog.form.messagePlaceholder")}
        multiline={true}
        variant="outlined"
        disabled={!campaignEditable && campaign.status !== "CANCELADA"}
      />
    );
  };

  const cancelCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/cancel`);
      toast.success(i18n.t("campaigns.toasts.cancel"));
      setCampaign((prev) => ({ ...prev, status: "CANCELADA" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const restartCampaign = async () => {
    try {
      await api.post(`/campaigns/${campaign.id}/restart`);
      toast.success(i18n.t("campaigns.toasts.restart"));
      setCampaign((prev) => ({ ...prev, status: "Proceso" }));
      resetPagination();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className={classes.root}>
      <ConfirmationModal
        title={i18n.t("campaigns.confirmationModal.deleteTitle")}
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        onConfirm={deleteMedia}
      >
        {i18n.t("campaigns.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {campaignEditable ? (
            <>
              {campaignId
                ? `${i18n.t("campaigns.dialog.update")}`
                : `${i18n.t("campaigns.dialog.new")}`}
            </>
          ) : (
            <>{`${i18n.t("campaigns.dialog.readonly")}`}</>
          )}
        </DialogTitle>
        <div style={{ display: "none" }}>
          <input
            type="file"
            ref={attachmentFile}
            onChange={(e) => handleAttachmentFile(e)}
          />
        </div>
        <Formik
          initialValues={campaign}
          enableReinitialize={true}
          validationSchema={CampaignSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveCampaign(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ values, errors, touched, isSubmitting, setFieldValue }) => (
            <Form>
              <DialogContent dividers>
                <Grid spacing={2} container>
                  <Grid xs={12} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.name")}
                      name="name"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                      variant="outlined"
                      margin="dense"
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                    <Grid xs={12} md={4} item>
                    <Autocomplete
                      options={memoizedContactLists}
                      id="contactListId"
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.contactList")}
                          variant="outlined"
                          margin="dense"
                          error={touched.contactListId && Boolean(errors.contactListId)}
                          helperText={touched.contactListId && errors.contactListId}
                        />
                      )}
                     value={memoizedContactLists.find(list => list.id === values.contactListId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue("contactListId", newValue ? newValue.id : "");
                      }}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Autocomplete
                      options={memoizedTagLists}
                      id="tagListId"
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.tagList")}
                          variant="outlined"
                          margin="dense"
                          error={touched.tagListId && Boolean(errors.tagListId)}
                          helperText={touched.tagListId && errors.tagListId}
                        />
                      )}
                      value={memoizedTagLists.find(tag => tag.id === values.tagListId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue("tagListId", newValue ? newValue.id : "");
                      }}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Autocomplete
                      options={memoizedWhatsapps}
                      id="whatsappId"
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.whatsapp")}
                          variant="outlined"
                          margin="dense"
                          error={touched.whatsappId && Boolean(errors.whatsappId)}
                          helperText={touched.whatsappId && errors.whatsappId}
                        />
                      )}
                      value={memoizedWhatsapps.find(whatsapp => whatsapp.id === values.whatsappId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue("whatsappId", newValue ? newValue.id : "");
                      }}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Field
                      as={TextField}
                      label={i18n.t("campaigns.dialog.form.scheduledAt")}
                      name="scheduledAt"
                      error={touched.scheduledAt && Boolean(errors.scheduledAt)}
                      helperText={touched.scheduledAt && errors.scheduledAt}
                      variant="outlined"
                      margin="dense"
                      type="datetime-local"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      fullWidth
                      className={classes.textField}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} md={4} item>
                    <Autocomplete
                      options={memoizedFiles}
                      id="fileListId"
                      getOptionLabel={(option) => option.name}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={i18n.t("campaigns.dialog.form.fileList")}
                          variant="outlined"
                          margin="dense"
                          error={touched.fileListId && Boolean(errors.fileListId)}
                          helperText={touched.fileListId && errors.fileListId}
                        />
                      )}
                      value={memoizedFiles.find(f => f.id === values.fileListId) || null}
                      onChange={(event, newValue) => {
                        setFieldValue("fileListId", newValue ? newValue.id : "");
                      }}
                      disabled={!campaignEditable}
                    />
                  </Grid>
                  <Grid xs={12} item>
                    <Tabs
                      value={messageTab}
                      indicatorColor="primary"
                      textColor="primary"
                      className={classes.tabmsg}
                      onChange={(e, v) => setMessageTab(v)}
                      variant="fullWidth"
                      centered
                      style={{
                        borderRadius: 2,
                      }}
                    >
                      <Tab label="Msg. 1" index={0} />
                      <Tab label="Msg. 2" index={1} />
                      <Tab label="Msg. 3" index={2} />
                      <Tab label="Msg. 4" index={3} />
                      <Tab label="Msg. 5" index={4} />
                    </Tabs>
                    <Box style={{ paddingTop: 20, border: "none" }}>
                      {messageTab === 0 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message1")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage1"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message1")}</>
                          )}
                        </>
                      )}
                      {messageTab === 1 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message2")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage2"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message2")}</>
                          )}
                        </>
                      )}
                      {messageTab === 2 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message3")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage3"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message3")}</>
                          )}
                        </>
                      )}
                      {messageTab === 3 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message4")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage4"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message4")}</>
                          )}
                        </>
                      )}
                      {messageTab === 4 && (
                        <>
                          {values.confirmation ? (
                            <Grid spacing={2} container>
                              <Grid xs={12} md={8} item>
                                <>{renderMessageField("message5")}</>
                              </Grid>
                              <Grid xs={12} md={4} item>
                                <>
                                  {renderConfirmationMessageField(
                                    "confirmationMessage5"
                                  )}
                                </>
                              </Grid>
                            </Grid>
                          ) : (
                            <>{renderMessageField("message5")}</>
                          )}
                        </>
                      )}
                    </Box>
                  </Grid>
                  {(campaign.mediaPath || attachment) && (
                    <Grid xs={12} item>
                      <Button startIcon={<AttachFileIcon />}>
                        {attachment != null
                          ? attachment.name
                          : campaign.mediaName}
                      </Button>
                      {campaignEditable && (
                        <IconButton
                          onClick={() => setConfirmationOpen(true)}
                          color="secondary"
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      )}
                    </Grid>
                  )}
                </Grid>
              </DialogContent>
              <DialogActions>
                {campaign.status === "CANCELADA" && (
                  <Button
                    color="primary"
                    onClick={() => restartCampaign()}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.restart")}
                  </Button>
                )}
                {campaign.status === "Proceso" && (
                  <Button
                    color="primary"
                    onClick={() => cancelCampaign()}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.cancel")}
                  </Button>
                )}
                {!attachment && !campaign.mediaPath && campaignEditable && (
                  <Button
                    color="primary"
                    onClick={() => attachmentFile.current.click()}
                    disabled={isSubmitting}
                    variant="outlined"
                  >
                    {i18n.t("campaigns.dialog.buttons.attach")}
                  </Button>
                )}
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("campaigns.dialog.buttons.close")}
                </Button>
                {(campaignEditable || campaign.status === "CANCELADA") && (
                  <Button
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    variant="contained"
                    className={classes.btnWrapper}
                  >
                    {campaignId
                      ? `${i18n.t("campaigns.dialog.buttons.edit")}`
                      : `${i18n.t("campaigns.dialog.buttons.add")}`}
                    {isSubmitting && (
                      <CircularProgress
                        size={24}
                        className={classes.buttonProgress}
                      />
                    )}
                  </Button>
                )}
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </div>
  );
};

CampaignModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  campaignId: PropTypes.string,
  initialValues: PropTypes.object,
  onSave: PropTypes.func,
  resetPagination: PropTypes.func,
};

export default CampaignModal;